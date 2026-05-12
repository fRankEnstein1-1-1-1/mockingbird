import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotesContext } from '../context/NotesContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { 
        folders, notes, fetchFolders, fetchNotes, createFolder, deleteFolder,
        createNote, deleteNote, updateNote, uploadImage, 
    uploadVoice,
    } = useContext(NotesContext);

    const [currentFolder, setCurrentFolder] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);

    const [newFolderName, setNewFolderName] = useState('');
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [noteTitle, setNoteTitle] = useState('');
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        fetchFolders();
    }, []);

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
        if (!currentFolder?._id) {
            alert("Please select a folder first.");
            return;
        }
        if (!newNoteTitle.trim()) return;
        await createNote(currentFolder._id, newNoteTitle, '');
        setNewNoteTitle('');
        await fetchNotes(currentFolder._id);
    };

const openNote = (note) => {
    setSelectedNote(note);
    setNoteTitle(note.title || '');
    setNoteText(note.content?.text || '');   // ← Safe fallback
};

    const autoSaveNote = useCallback(async () => {
        if (!selectedNote) return;
        try {
            await updateNote(selectedNote._id, noteTitle, noteText);
            setSelectedNote(prev => ({
                ...prev,
                title: noteTitle,
                content: { ...prev.content, text: noteText }
            }));
        } catch (err) {
            console.error("Auto save failed:", err);
        }
    }, [selectedNote, noteTitle, noteText, updateNote]);

// Handle Image Upload
const handleUploadImage = async (noteId, file) => {
    if (!file) return;

    try {
        // Call backend upload
        const updatedNoteFromServer = await uploadImage(noteId, file);

        if (updatedNoteFromServer) {
            // Best case: Backend returns full updated note
            setSelectedNote(updatedNoteFromServer);
            setNoteTitle(updatedNoteFromServer.title);
            setNoteText(updatedNoteFromServer.content?.text || '');
        } else {
            // Fallback: Refresh from notes context
            await refreshCurrentNote(noteId);
        }
    } catch (err) {
        console.error("Image upload failed:", err);
        alert("Failed to upload image");
    }
};

// Handle Voice Upload
const handleUploadVoice = async (noteId, file) => {
    if (!file) return;

    try {
        const updatedNoteFromServer = await uploadVoice(noteId, file);

        if (updatedNoteFromServer) {
            setSelectedNote(updatedNoteFromServer);
            setNoteTitle(updatedNoteFromServer.title);
            setNoteText(updatedNoteFromServer.content?.text || '');
        } else {
            await refreshCurrentNote(noteId);
        }
    } catch (err) {
        console.error("Voice upload failed:", err);
        alert("Failed to upload voice note");
    }
};

// Helper to refresh current note after upload
const refreshCurrentNote = async (noteId) => {
    try {
        // Re-fetch all notes in current folder
        await fetchNotes(currentFolder?._id || null);
        
        // Find the updated note
        const refreshedNote = notes.find(n => n._id === noteId);
        if (refreshedNote) {
            setSelectedNote(refreshedNote);
            setNoteTitle(refreshedNote.title);
            setNoteText(refreshedNote.content?.text || '');
        }
    } catch (err) {
        console.error("Failed to refresh note:", err);
    }
};

    const closeNote = async () => {
        await autoSaveNote();
        setSelectedNote(null);
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Delete this note?")) return;
        await deleteNote(noteId);
        setSelectedNote(null);
    };

    const handleDeleteFolder = async (folderId) => {
        if (!window.confirm("Delete this folder and ALL contents?")) return;
        await deleteFolder(folderId);
        if (currentFolder?._id === folderId) goToRoot();
        else await fetchFolders();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>📚 Mockingbird</h2>
                <div>
                    <span>Welcome, {user?.username}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="dashboard-main">
                {/* Folder Explorer */}
                {!selectedNote && (
                    <div className="folder-view">
                        {/* Breadcrumb */}
                        <div className="breadcrumb">
                            <span onClick={goToRoot} style={{ cursor: 'pointer' }}>Home</span>
                            {getBreadcrumbs().map((crumb, i) => (
                                <span key={i}> / <span onClick={() => enterFolder(crumb)} style={{ cursor: 'pointer' }}>{crumb.name}</span></span>
                            ))}
                        </div>

                        {/* Rest of folder view remains same */}
                        <div className="folder-header">
                            <h2>{currentFolder ? currentFolder.name : `${user?.username}'s Workspace`}</h2>
                            <div className="quick-actions">
                                <input type="text" placeholder="New Folder" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                                <button onClick={handleCreateFolder}>+ Folder</button>

                                {currentFolder && (
                                    <>
                                        <input type="text" placeholder="New Note Title" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} />
                                        <button onClick={handleCreateNote}>+ Note</button>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Subfolders */}
                        <div className="section">
                            <h3>📁 Folders ({subfolders.length})</h3>
                            {subfolders.length === 0 ? <p className="empty">No subfolders yet.</p> : (
                                <div className="grid">
                                    {subfolders.map(folder => (
                                        <div key={folder._id} className="folder-card">
                                            <div onClick={() => enterFolder(folder)} className="folder-name">📁 {folder.name}</div>
                                            <button onClick={() => handleDeleteFolder(folder._id)} className="delete-small">🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        {currentFolder && (
                            <div className="section">
                                <h3>📝 Notes ({notes.length})</h3>
                                {notes.length === 0 ? (
                                    <p className="empty">No notes yet.</p>
                                ) : (
                                    <div className="notes-grid">
                                        {notes.map(note => (
                                            <div 
                                                key={note._id} 
                                                className="note-card"
                                                onClick={() => openNote(note)}
                                            >
                                                <h4>{note.title}</h4>
                                                <p className="preview">{note.content?.text?.substring(0, 120) || 'No content...'}</p>
                                                <div className="meta">
                                                    {note.content?.images?.length > 0 && `📷 ${note.content.images.length}`}
                                                    {note.content?.voiceNotes?.length > 0 && ` 🎤 ${note.content.voiceNotes.length}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

             {/* ==================== NOTE VIEW (Editable + Breadcrumbs) ==================== */}
              {selectedNote && (
    <div className="note-detail-view">
 
        {/* ── Top Bar: Breadcrumb + Actions ── */}
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
                <button onClick={closeNote} className="back-btn">← Back</button>
                <button onClick={() => handleDeleteNote(selectedNote._id)} className="delete-btn-top">
                    🗑 Delete
                </button>
            </div>
        </div>
 
        {/* ── Full-screen Note Editor ── */}
        <div className="note-fullscreen">
 
            {/* Title */}
            <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                onBlur={autoSaveNote}
                className="note-title-input"
                placeholder="Untitled Note"
            />
 
            {/* Divider */}
            <div className="note-divider" />
 
            {/* Body area: textarea fills remaining height */}
            <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={autoSaveNote}
                className="note-textarea"
                placeholder="Start writing..."
            />
 
            {/* ── Media Section ── */}
            {/* Images */}
            {selectedNote.content?.images?.length > 0 && (
                <div className="media-section">
                    <p className="media-section-label">📷 Images</p>
                    <div className="images-gallery">
                        {selectedNote.content.images.map((img, i) => (
                            <div key={i} className="gallery-item">
                                <img
                                    src={img.url || img}
                                    alt={img.name || `Image ${i + 1}`}
                                    className="gallery-img"
                                    onClick={() => window.open(img.url || img, '_blank')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
 
            {/* Voice Notes */}
            {selectedNote.content?.voiceNotes?.length > 0 && (
                <div className="media-section">
                    <p className="media-section-label">🎤 Voice Notes</p>
                    <div className="voice-list">
                        {selectedNote.content.voiceNotes.map((voice, i) => (
                            <div key={i} className="voice-item">
                                <span className="voice-label">
                                    🎵 {voice.name || `Voice Note ${i + 1}`}
                                </span>
                                <audio
                                    controls
                                    src={voice.url || voice}
                                    className="voice-player"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
 
            {/* ── Upload Controls ── */}
            <div className="media-upload">
                <label className="upload-label">
                    📷 Add Image
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage(selectedNote._id, e.target.files[0])}
                    />
                </label>
                <label className="upload-label">
                    🎤 Add Voice
                    <input
                        type="file"
                        accept="audio/*"
                       onChange={(e) => handleUploadVoice(selectedNote._id, e.target.files[0])}
                    />
                </label>
            </div>
 
        </div>
    </div>
)}
            </div>
        </div>
    );
};

export default Dashboard;