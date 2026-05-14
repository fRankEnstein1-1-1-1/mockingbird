import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotesContext } from '../context/NotesContext';
import { BookOpen, Folder, FileText, Trash2, ArrowLeft, Image, Mic, Plus, X } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const {
        folders, notes, fetchFolders, fetchNotes, createFolder, deleteFolder,
        createNote, deleteNote, updateNote, uploadImage, uploadVoice,
    } = useContext(NotesContext);

    const [currentFolder, setCurrentFolder] = useState(null);
    const [selectedNote,  setSelectedNote]  = useState(null);

    const [newFolderName, setNewFolderName] = useState('');
    const [newNoteTitle,  setNewNoteTitle]  = useState('');
    const [noteTitle,     setNoteTitle]     = useState('');

    const editorRef     = useRef(null);
    const savedRangeRef = useRef(null);

    const [activeFormats, setActiveFormats] = useState({
        bold: false, italic: false, underline: false, strikeThrough: false,
    });

    const [isRecording, setIsRecording] = useState(false);

const mediaRecorderRef = useRef(null);

const audioChunksRef = useRef([]);

const [recordingTime, setRecordingTime] = useState(0);

const timerRef = useRef(null);

    // ── Selection helpers ─────────────────────────────────────────────────────
    // Called onMouseDown on every toolbar control so selection isn't lost
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
    };

    const restoreSelection = () => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        const sel = window.getSelection();
        if (savedRangeRef.current && sel) {
            sel.removeAllRanges();
            sel.addRange(savedRangeRef.current);
        }
    };

    // All toolbar buttons use onMouseDown + e.preventDefault()
    // so the editor never loses focus / selection before execCommand fires
    const execCmd = (command, value = null) => {
        restoreSelection();
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateActiveFormats();
    };

    const updateActiveFormats = () => {
        setActiveFormats({
            bold:          document.queryCommandState('bold'),
            italic:        document.queryCommandState('italic'),
            underline:     document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
        });
    };

    // ── Folder & note helpers ─────────────────────────────────────────────────
    useEffect(() => { fetchFolders(); }, []); // eslint-disable-line

    const subfolders = folders.filter(f => f.parentId === (currentFolder?._id || null));

    const getBreadcrumbs = () => {
        const crumbs = [];
        let current = currentFolder;
        while (current) {
            crumbs.unshift(current);
            current = folders.find(f => f._id === current.parentId);
        }
        return crumbs;
    };

    const enterFolder = async (folder) => {
        setCurrentFolder(folder);
        await fetchNotes(folder?._id || null);
        setSelectedNote(null);
    };

    const goToRoot = () => {
        setCurrentFolder(null);
        setSelectedNote(null);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await createFolder(newFolderName, currentFolder?._id || null);
        setNewFolderName('');
        await fetchFolders();
    };

    const handleCreateNote = async () => {
        if (!currentFolder?._id) { alert('Please select a folder first.'); return; }
        if (!newNoteTitle.trim()) return;
        await createNote(currentFolder._id, newNoteTitle, '');
        setNewNoteTitle('');
        await fetchNotes(currentFolder._id);
    };

    const openNote = (note) => {
        setSelectedNote(note);
        setNoteTitle(note.title || '');
        // Defer so editorRef is mounted before we write to it
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.innerHTML = note.content?.text || '';
                editorRef.current.focus();
            }
        }, 0);
    };

    const getCurrentHTML = () => editorRef.current?.innerHTML || '';

    const autoSaveNote = useCallback(async () => {
        if (!selectedNote) return;
        const html = getCurrentHTML();
        try {
            const updated = await updateNote(selectedNote._id, noteTitle, html);
            setSelectedNote(updated);
        } catch (err) {
            console.error('Auto save failed:', err);
        }
    }, [selectedNote, noteTitle, updateNote]); // eslint-disable-line

    const closeNote = async () => {
        await autoSaveNote();
        setSelectedNote(null);
        if (editorRef.current) editorRef.current.innerHTML = '';
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Delete this note?')) return;
        await deleteNote(noteId);
        setSelectedNote(null);
        if (editorRef.current) editorRef.current.innerHTML = '';
    };

    const handleDeleteFolder = async (folderId) => {
        if (!window.confirm('Delete this folder and ALL contents?')) return;
        await deleteFolder(folderId);
        if (currentFolder?._id === folderId) goToRoot();
        else await fetchFolders();
    };

    const handleUploadImage = async (noteId, file) => {
        if (!file) return;
        try {
            const updated = await uploadImage(noteId, file);
            if (updated) { setSelectedNote(updated); setNoteTitle(updated.title); }
            else {
                const url = URL.createObjectURL(file);
                setSelectedNote(prev => ({
                    ...prev,
                    content: { ...prev.content, images: [...(prev.content?.images || []), { url, name: file.name }] },
                }));
            }
        } catch { alert('Failed to upload image.'); }
    };

    const handleUploadVoice = async (noteId, file) => {
        if (!file) return;
        try {
            const updated = await uploadVoice(noteId, file);
            if (updated) { setSelectedNote(updated); setNoteTitle(updated.title); }
            else {
                const url = URL.createObjectURL(file);
                setSelectedNote(prev => ({
                    ...prev,
                    content: { ...prev.content, voiceNotes: [...(prev.content?.voiceNotes || []), { url, name: file.name }] },
                }));
            }
        } catch { alert('Failed to upload voice note.'); }
    };

    const startRecording = async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {

            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }

        };

        mediaRecorder.start();

        setIsRecording(true);
        setRecordingTime(0);

timerRef.current = setInterval(() => {
    setRecordingTime(prev => prev + 1);
}, 1000);


    } catch (error) {

        console.error("Recording failed:", error);

        alert("Microphone access denied.");

    }

};

const stopRecording = async () => {

    const mediaRecorder = mediaRecorderRef.current;

    if (!mediaRecorder) return;

    mediaRecorder.stop();
    clearInterval(timerRef.current);

    mediaRecorder.onstop = async () => {

        const audioBlob = new Blob(
            audioChunksRef.current,
            { type: "audio/webm" }
        );

        const audioFile = new File(
            [audioBlob],
            `recording-${Date.now()}.webm`,
            { type: "audio/webm" }
        );

        await handleUploadVoice(
            selectedNote._id,
            audioFile
        );

        setIsRecording(false);

    };

};

const formatTime = (seconds) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins}:${secs
        .toString()
        .padStart(2, '0')}`;
};

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="dashboard-container">

            <div className="dashboard-header">
                <h2><BookOpen size={18} style={{ display: 'inline', marginRight: '8px' }} /> Mockingbird</h2>
                <div>
                    <span>Welcome, {user?.username}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="dashboard-main">

                {/* ══════════════════════════ FOLDER VIEW ══════════════════════════ */}
                {!selectedNote && (
                    <div className="folder-view">
                        <div className="breadcrumb">
                            <span onClick={goToRoot} style={{ cursor: 'pointer' }}>Home</span>
                            {getBreadcrumbs().map((crumb, i) => (
                                <span key={i}> / <span onClick={() => enterFolder(crumb)} style={{ cursor: 'pointer' }}>{crumb.name}</span></span>
                            ))}
                        </div>

                        <div className="folder-header">
                            <h2>{currentFolder ? currentFolder.name : `${user?.username}'s Workspace`}</h2>
                            <div className="quick-actions">
                                <input type="text" placeholder="New Directory" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
                                <button onClick={handleCreateFolder}>+ Directory</button>
                                {currentFolder && (
                                    <>
                                        <input type="text" placeholder="New Note Title" value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} />
                                        <button onClick={handleCreateNote}>+ Note</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="section">
                            <h3><Folder size={32} style={{ display: 'inline', marginRight: '8px',color:"Yellow" }} />Directories({subfolders.length})</h3>
                            {subfolders.length === 0 ? <p className="empty">No subdirectories yet.</p> : (
                                <div className="grid">
                                    {subfolders.map(folder => (
                                        <div key={folder._id} className="folder-card">
                                            <div onClick={() => enterFolder(folder)} className="folder-name"><Folder size={16} style={{ display: 'inline', marginRight: '8px' }} />
  {folder.name}</div>
                                            <button onClick={() => handleDeleteFolder(folder._id)} className="delete-small"> <Trash2 size={14} style={{color:"whitesmoke"}} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {currentFolder && (
                            <div className="section">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
  <FileText size={14} /> Notes ({notes.length})
</h3>
                                {notes.length === 0 ? <p className="empty">No notes yet.</p> : (
                                    <div className="notes-grid">
                                        {notes.map(note => (
                                            <div key={note._id} className="note-card" onClick={() => openNote(note)}>
                                                <h4>{note.title}</h4>
                                                <p className="preview">
                                                    {(note.content?.text || '')
                                                        .replace(/<[^>]*>/g, ' ')
                                                        .replace(/\s+/g, ' ')
                                                        .trim()
                                                        .substring(0, 120) || 'No content...'}
                                                </p>
                                                <div className="meta">
                                                    {note.content?.images?.length     > 0 && `📷 ${note.content.images.length}`}
                                                    {note.content?.voiceNotes?.length > 0 && ` <Mic size={16} style={{ marginRight: '6px' }} /> ${note.content.voiceNotes.length}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════ NOTE VIEW ══════════════════════════ */}
                {selectedNote && (
                    <div className="note-detail-view">

                        <div className="note-topbar">
                            <div className="breadcrumb note-breadcrumb">
                                <span onClick={goToRoot} style={{ cursor: 'pointer' }}>Home</span>
                                {getBreadcrumbs().map((crumb, i) => (
                                    <span key={i}>
                                        <span className="breadcrumb-sep">›</span>
                                        <span onClick={() => enterFolder(crumb)} style={{ cursor: 'pointer' }}>{crumb.name}</span>
                                    </span>
                                ))}
                                <span><span className="breadcrumb-sep">›</span>{selectedNote.title}</span>
                            </div>
                            <div className="note-topbar-actions">
                                <button onClick={closeNote} className="back-btn"> <ArrowLeft size={14} style={{ marginRight: '4px' }} /> Back</button>
                                <button onClick={() => handleDeleteNote(selectedNote._id)} className="delete-btn-top">🗑 Delete</button>
                            </div>
                        </div>

                        <div className="note-fullscreen">

                            <input
                                type="text"
                                value={noteTitle}
                                onChange={e => setNoteTitle(e.target.value)}
                                onBlur={autoSaveNote}
                                className="note-title-input"
                                placeholder="Untitled Note"
                            />

                            <div className="note-divider" />

                            {/* ── Rich Text Toolbar ── */}
                            <div className="rte-toolbar">

                                {/* Bold / Italic / Underline / Strike */}
                                <div className="rte-group">
                                    <button className={`rte-btn${activeFormats.bold          ? ' active' : ''}`} title="Bold (Ctrl+B)"
                                        onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('bold'); }}><b>B</b></button>
                                    <button className={`rte-btn${activeFormats.italic        ? ' active' : ''}`} title="Italic (Ctrl+I)"
                                        onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('italic'); }}><i>I</i></button>
                                    <button className={`rte-btn${activeFormats.underline     ? ' active' : ''}`} title="Underline (Ctrl+U)"
                                        onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('underline'); }}><u>U</u></button>
                                    <button className={`rte-btn${activeFormats.strikeThrough ? ' active' : ''}`} title="Strikethrough"
                                        onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('strikeThrough'); }}><s>S</s></button>
                                </div>

                                <div className="rte-divider" />

                                {/* Alignment */}
                                <div className="rte-group">
                                    <button className="rte-btn" title="Left"   onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('justifyLeft');   }}>⬅</button>
                                    <button className="rte-btn" title="Center" onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('justifyCenter'); }}>↔</button>
                                    <button className="rte-btn" title="Right"  onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('justifyRight');  }}>➡</button>
                                </div>

                                <div className="rte-divider" />

                                {/* Lists */}
                                <div className="rte-group">
                                    <button className="rte-btn" title="Bullet list"
                                        onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('insertUnorderedList'); }}>• List</button>
                                    <button className="rte-btn" title="Numbered list"
                                        onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('insertOrderedList'); }}>1. List</button>
                                </div>

                                <div className="rte-divider" />

                                {/* Text color */}
                                <label className="rte-color-label" title="Text color">
                                    <span className="rte-color-icon" style={{ color: '#fff' }}>A</span>
                                    <input
                                        type="color"
                                        defaultValue="#ffffff"
                                        className="rte-color-input"
                                        onMouseDown={saveSelection}
                                        onChange={e => { restoreSelection(); document.execCommand('foreColor', false, e.target.value); editorRef.current?.focus(); }}
                                    />
                                </label>

                                {/* Highlight color */}
                                <label className="rte-color-label rte-highlight-label" title="Highlight">
                                    <span className="rte-color-icon" style={{ background: '#ffff00', color: '#000', borderRadius: 3, padding: '0 3px' }}>H</span>
                                    <input
                                        type="color"
                                        defaultValue="#ffff00"
                                        className="rte-color-input"
                                        onMouseDown={saveSelection}
                                        onChange={e => { restoreSelection(); document.execCommand('hiliteColor', false, e.target.value); editorRef.current?.focus(); }}
                                    />
                                </label>

                                <div className="rte-divider" />

                                {/* Font size */}
                                <select
                                    className="rte-select"
                                    defaultValue="3"
                                    onMouseDown={saveSelection}
                                    onChange={e => execCmd('fontSize', e.target.value)}
                                >
                                    <option value="1">Tiny</option>
                                    <option value="2">Small</option>
                                    <option value="3">Normal</option>
                                    <option value="4">Large</option>
                                    <option value="5">X-Large</option>
                                    <option value="6">Huge</option>
                                </select>

                                <div className="rte-divider" />

                                {/* Clear formatting */}
                                <button className="rte-btn rte-btn-clear" title="Clear formatting"
                                    onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('removeFormat'); }}>
                                    ✕ Clear
                                </button>

                            </div>

                            {/* ── Editor ── */}
                            <div
                                ref={editorRef}
                                className="note-editor"
                                contentEditable
                                suppressContentEditableWarning
                                data-placeholder="Start writing..."
                                onKeyUp={updateActiveFormats}
                                onMouseUp={updateActiveFormats}
                                onSelect={saveSelection}
                                onBlur={autoSaveNote}
                            />

                            {/* Images */}
                            {selectedNote.content?.images?.length > 0 && (
                                <div className="media-section">
                                    <p className="media-section-label"> <Image size={14} style={{ display: 'inline', marginRight: '6px' }} /> Images</p>
                                    <div className="images-gallery">
                                        {selectedNote.content.images.map((img, i) => (
                                            <div key={i} className="gallery-item">
                                                <img src={img.url || img} alt={img.name || `Image ${i + 1}`}
                                                    className="gallery-img"
                                                    onClick={() => window.open(img.url || img, '_blank')} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Voice notes */}
                            {selectedNote.content?.voiceNotes?.length > 0 && (
                                <div className="media-section">
                                    <p className="media-section-label">🎤 Voice Notes</p>
                                    <div className="voice-list">
                                        {selectedNote.content.voiceNotes.map((voice, i) => (
                                            <div key={i} className="voice-item">
                                                <span className="voice-label">🎵 {voice.name || `Voice Note ${i + 1}`}</span>
                                                <audio controls src={voice.url || voice} className="voice-player" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload controls */}
             <div className="media-upload">

    {/* Image Upload */}
    <label className="upload-label">

        <Image
            size={16}
            style={{ marginRight: '6px' }}
        />

        Add Image

        <input
            type="file"
            accept="image/*"
            onChange={(e) =>
                handleUploadImage(
                    selectedNote._id,
                    e.target.files[0]
                )
            }
        />

    </label>


    {/* Voice Recording */}
<button
    className={`upload-label ${
        isRecording ? 'recording' : ''
    }`}
    onClick={
        isRecording
            ? stopRecording
            : startRecording
    }
>

    <Mic
        size={16}
        style={{ marginRight: '6px' }}
    />

    {isRecording
        ? `🔴 Recording... ${formatTime(recordingTime)}`
        : '🎙 Record Voice'}

</button>

</div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;