import React, { useContext, useState, useEffect } from 'react';
import { NotesContext } from '../context/NotesContext';

const NoteEditor = () => {
    const { currentNote, updateNote, uploadImage, uploadVoice } = useContext(NotesContext);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (currentNote) {
            setTitle(currentNote.title);
            setText(currentNote.content.text);
            setHasChanges(false);
        }
    }, [currentNote]);

    const handleSave = async () => {
        if (currentNote && hasChanges) {
            await updateNote(currentNote._id, title, text);
            setHasChanges(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file && currentNote) {
            await uploadImage(currentNote._id, file);
        }
    };

    const handleVoiceUpload = async (e) => {
        const file = e.target.files[0];
        if (file && currentNote) {
            await uploadVoice(currentNote._id, file);
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setHasChanges(true);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        setHasChanges(true);
    };

    if (!currentNote) {
        return (
            <div style={styles.container}>
                <div style={styles.empty}>
                    <h3>No note selected</h3>
                    <p>Select a note from the list to start editing</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.toolbar}>
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    style={styles.titleInput}
                    placeholder="Note title"
                />
                <div style={styles.toolbarButtons}>
                    <label style={styles.uploadBtn}>
                        📷 Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <label style={styles.uploadBtn}>
                        🎤 Voice
                        <input type="file" accept="audio/*" onChange={handleVoiceUpload} style={{ display: 'none' }} />
                    </label>
                    <button onClick={handleSave} style={{...styles.saveBtn, opacity: hasChanges ? 1 : 0.5}}>
                        💾 Save
                    </button>
                </div>
            </div>

            <textarea
                value={text}
                onChange={handleTextChange}
                style={styles.textArea}
                placeholder="Start typing your notes..."
            />

            {/* Display Images */}
            {currentNote.content.images.length > 0 && (
                <div style={styles.mediaSection}>
                    <h4>Images</h4>
                    <div style={styles.imageGrid}>
                        {currentNote.content.images.map((url, index) => (
                            <img key={index} src={url} alt="note" style={styles.image} />
                        ))}
                    </div>
                </div>
            )}

            {/* Display Voice Notes */}
            {currentNote.content.voiceNotes.length > 0 && (
                <div style={styles.mediaSection}>
                    <h4>Voice Notes</h4>
                    {currentNote.content.voiceNotes.map((url, index) => (
                        <audio key={index} controls style={styles.audio}>
                            <source src={url} />
                        </audio>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        overflow: 'auto'
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#999'
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#f8f9fa'
    },
    titleInput: {
        flex: 1,
        padding: '10px',
        fontSize: '18px',
        fontWeight: 'bold',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginRight: '20px'
    },
    toolbarButtons: {
        display: 'flex',
        gap: '10px'
    },
    uploadBtn: {
        padding: '8px 12px',
        fontSize: '14px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    saveBtn: {
        padding: '8px 16px',
        fontSize: '14px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    textArea: {
        flex: 1,
        padding: '20px',
        fontSize: '16px',
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit'
    },
    mediaSection: {
        padding: '20px',
        borderTop: '1px solid #ddd'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '10px',
        marginTop: '10px'
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: '1px solid #ddd'
    },
    audio: {
        width: '100%',
        marginTop: '10px'
    }
};

export default NoteEditor;