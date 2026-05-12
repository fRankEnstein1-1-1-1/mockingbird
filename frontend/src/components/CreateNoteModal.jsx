import React, { useState, useContext } from 'react';
import { NotesContext } from '../context/NotesContext';

const CreateNoteModal = ({ folderId, onClose, onCreated }) => {
    const { createNote } = useContext(NotesContext);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        const newNote = await createNote(folderId, title, '');
        setLoading(false);
        onCreated(newNote);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.title}>Create New Note</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Note title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                        autoFocus
                    />
                    <div style={styles.buttons}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={styles.createBtn}>
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '400px',
        maxWidth: '90%'
    },
    title: {
        marginTop: 0,
        marginBottom: '20px'
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    buttons: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
    },
    cancelBtn: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    createBtn: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default CreateNoteModal;