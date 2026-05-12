import React, { useContext, useState } from 'react';
import { NotesContext } from '../context/NotesContext';
import FolderTree from './FolderTree';

const Sidebar = () => {
    const { createFolder, folders } = useContext(NotesContext);
    const [newFolderName, setNewFolderName] = useState('');
    const [showInput, setShowInput] = useState(false);

    const handleCreateFolder = async () => {
        if (newFolderName.trim()) {
            await createFolder(newFolderName);
            setNewFolderName('');
            setShowInput(false);
        }
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.header}>
                <h3>Folders</h3>
                <button onClick={() => setShowInput(!showInput)} style={styles.addBtn}>
                    + New Folder
                </button>
            </div>

            {showInput && (
                <div style={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                        style={styles.input}
                        autoFocus
                    />
                    <button onClick={handleCreateFolder} style={styles.createBtn}>Create</button>
                </div>
            )}

            <FolderTree />
        </div>
    );
};

const styles = {
    sidebar: {
        width: '250px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #ddd',
        padding: '20px',
        overflowY: 'auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
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
        marginBottom: '15px'
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
    }
};

export default Sidebar;