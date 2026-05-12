import React, { useContext, useState } from 'react';
import { NotesContext } from '../context/NotesContext';

const NotesList = () => {
    const { 
        notes, 
        currentFolder, 
        currentNote, 
        setCurrentNote, 
        createNote, 
        deleteNote 
    } = useContext(NotesContext);

    const [showInput, setShowInput] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');

    const handleCreateNote = async () => {
        if (newNoteTitle.trim() && currentFolder) {
            await createNote(currentFolder._id, newNoteTitle, '');
            setNewNoteTitle('');
            setShowInput(false);
        }
    };

    const handleDeleteNote = async (e, noteId) => {
        e.stopPropagation();
        if (window.confirm('Delete this note?')) {
            await deleteNote(noteId);
        }
    };

    const handleNoteClick = (note) => {
        setCurrentNote(note);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3>{currentFolder ? currentFolder.name : 'Select a folder'}</h3>
                {currentFolder && (
                    <button onClick={() => setShowInput(!showInput)} style={styles.addBtn}>
                        + New Note
                    </button>
                )}
            </div>

            {showInput && currentFolder && (
                <div style={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Note title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateNote()}
                        style={styles.input}
                        autoFocus
                    />
                    <button onClick={handleCreateNote} style={styles.createBtn}>Create</button>
                </div>
            )}

            <div style={styles.notesList}>
                {!currentFolder ? (
                    <p style={styles.empty}>Select a folder to view notes</p>
                ) : notes.length === 0 ? (
                    <p style={styles.empty}>No notes in this folder. Create one!</p>
                ) : (
                    notes.map(note => (
                        <div
                            key={note._id}
                            style={{
                                ...styles.noteItem,
                                backgroundColor: currentNote?._id === note._id ? '#e3f2fd' : 'white'
                            }}
                            onClick={() => handleNoteClick(note)}
                        >
                            <div style={styles.noteTitle}>{note.title}</div>
                            <div style={styles.notePreview}>
                                {note.content.text.substring(0, 50)}...
                            </div>
                            <button 
                                onClick={(e) => handleDeleteNote(e, note._id)}
                                style={styles.deleteBtn}
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '300px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid #ddd'
    },
    addBtn: {
        padding: '5px 10px',
        fontSize: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    inputContainer: {
        display: 'flex',
        gap: '5px',
        padding: '15px',
        borderBottom: '1px solid #ddd'
    },
    input: {
        flex: 1,
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    createBtn: {
        padding: '8px 12px',
        fontSize: '14px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    notesList: {
        flex: 1,
        overflowY: 'auto',
        padding: '10px'
    },
    noteItem: {
        position: 'relative',
        padding: '15px',
        marginBottom: '10px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    noteTitle: {
        fontWeight: 'bold',
        marginBottom: '5px',
        fontSize: '14px'
    },
    notePreview: {
        fontSize: '12px',
        color: '#666'
    },
    deleteBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px'
    },
    empty: {
        color: '#999',
        fontSize: '14px',
        textAlign: 'center',
        marginTop: '40px'
    }
};

export default NotesList;