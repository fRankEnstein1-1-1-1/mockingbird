import React, { useContext, useState, useEffect } from 'react';
import { NotesContext } from '../context/NotesContext';

const NoteViewer = ({ note, onBack, onNoteUpdated }) => {
    const { updateNote, uploadImage, uploadVoice, deleteNote } = useContext(NotesContext);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setText(note.content?.text || '');
        }
    }, [note]);

    const handleSave = async () => {
        if (hasChanges) {
            await updateNote(note._id, title, text);
            setHasChanges(false);
            setIsEditing(false);
            if (onNoteUpdated) onNoteUpdated();
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            await deleteNote(note._id);
            onBack();
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadImage(note._id, file);
            if (onNoteUpdated) onNoteUpdated();
        }
    };

    const handleVoiceUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadVoice(note._id, file);
            if (onNoteUpdated) onNoteUpdated();
        }
    };

    if (!note) return null;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backBtn}>
                    ← Back to Folders
                </button>
                <div style={styles.actionButtons}>
                    {!isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                                ✏️ Edit
                            </button>
                            <button onClick={handleDelete} style={styles.deleteBtn}>
                                🗑️ Delete
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleSave} style={styles.saveBtn}>
                                💾 Save
                            </button>
                            <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div style={styles.content}>
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setHasChanges(true);
                            }}
                            style={styles.titleInput}
                            placeholder="Note title"
                        />
                        <textarea
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setHasChanges(true);
                            }}
                            style={styles.textArea}
                            placeholder="Write your note content here..."
                        />
                    </>
                ) : (
                    <>
                        <h1 style={styles.title}>{title}</h1>
                        <div style={styles.text}>{text}</div>
                    </>
                )}

                {/* Media Upload Section */}
                <div style={styles.mediaUpload}>
                    <label style={styles.uploadBtn}>
                        📷 Upload Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <label style={styles.uploadBtn}>
                        🎤 Upload Voice
                        <input type="file" accept="audio/*" onChange={handleVoiceUpload} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* Display Images */}
                {note.content?.images?.length > 0 && (
                    <div style={styles.mediaSection}>
                        <h3>Images</h3>
                        <div style={styles.imageGrid}>
                            {note.content.images.map((url, idx) => (
                                <img key={idx} src={url} alt={`note-img-${idx}`} style={styles.image} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Display Voice Notes */}
                {note.content?.voiceNotes?.length > 0 && (
                    <div style={styles.mediaSection}>
                        <h3>Voice Notes</h3>
                        {note.content.voiceNotes.map((url, idx) => (
                            <audio key={idx} controls src={url} style={styles.audio} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fafafa'
    },
    backBtn: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    actionButtons: {
        display: 'flex',
        gap: '10px'
    },
    editBtn: {
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    deleteBtn: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    saveBtn: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    cancelBtn: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '30px'
    },
    title: {
        marginTop: 0,
        color: '#333'
    },
    titleInput: {
        width: '100%',
        padding: '10px',
        fontSize: '24px',
        fontWeight: 'bold',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    text: {
        lineHeight: '1.6',
        color: '#555',
        whiteSpace: 'pre-wrap'
    },
    textArea: {
        width: '100%',
        minHeight: '300px',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    mediaUpload: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '10px'
    },
    uploadBtn: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    mediaSection: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #e0e0e0'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '15px'
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    audio: {
        width: '100%',
        marginTop: '10px'
    }
};

export default NoteViewer;