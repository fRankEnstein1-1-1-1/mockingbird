import React, { useContext, useState } from 'react';
import { NotesContext } from '../context/NotesContext';

const FolderTree = () => {
    const { folders, setCurrentFolder, deleteFolder, createFolder, fetchNotes } = useContext(NotesContext);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [creatingSubfolder, setCreatingSubfolder] = useState(null);
    const [subfolderName, setSubfolderName] = useState('');

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const handleFolderClick = async (folder) => {
        setCurrentFolder(folder);
        await fetchNotes(folder._id);
    };

    const handleDeleteFolder = async (e, folderId) => {
        e.stopPropagation();
        if (window.confirm('Delete this folder and all subfolders?')) {
            await deleteFolder(folderId);
        }
    };

    const handleCreateSubfolder = async (parentId) => {
        if (subfolderName.trim()) {
            await createFolder(subfolderName, parentId);
            setSubfolderName('');
            setCreatingSubfolder(null);
        }
    };

    const startCreatingSubfolder = (e, folderId) => {
        e.stopPropagation();
        setCreatingSubfolder(folderId);
    };

    // Get root folders (no parent)
    const rootFolders = folders.filter(f => !f.parentId);

    // Get subfolders for a parent
    const getSubfolders = (parentId) => {
        return folders.filter(f => f.parentId === parentId);
    };

    const renderFolder = (folder, level = 0) => {
        const subfolders = getSubfolders(folder._id);
        const isExpanded = expandedFolders[folder._id];

        return (
            <div key={folder._id} style={{ marginLeft: `${level * 15}px` }}>
                <div 
                    style={styles.folderItem}
                    onClick={() => handleFolderClick(folder)}
                >
                    <div style={styles.folderLeft}>
                        {subfolders.length > 0 && (
                            <span 
                                onClick={(e) => { e.stopPropagation(); toggleFolder(folder._id); }}
                                style={styles.expandIcon}
                            >
                                {isExpanded ? '▼' : '▶'}
                            </span>
                        )}
                        <span>📁 {folder.name}</span>
                    </div>
                    
                    <div style={styles.folderActions}>
                        <button 
                            onClick={(e) => startCreatingSubfolder(e, folder._id)}
                            style={styles.actionBtn}
                            title="Add subfolder"
                        >
                            +
                        </button>
                        <button 
                            onClick={(e) => handleDeleteFolder(e, folder._id)}
                            style={styles.deleteBtn}
                            title="Delete folder"
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                {creatingSubfolder === folder._id && (
                    <div style={{ ...styles.subfolderInput, marginLeft: `${(level + 1) * 15}px` }}>
                        <input
                            type="text"
                            placeholder="Subfolder name"
                            value={subfolderName}
                            onChange={(e) => setSubfolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateSubfolder(folder._id)}
                            style={styles.input}
                            autoFocus
                        />
                        <button onClick={() => handleCreateSubfolder(folder._id)} style={styles.createBtn}>✓</button>
                        <button onClick={() => setCreatingSubfolder(null)} style={styles.cancelBtn}>✕</button>
                    </div>
                )}

                {isExpanded && subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
            </div>
        );
    };

    return (
        <div style={styles.tree}>
            {rootFolders.length === 0 ? (
                <p style={styles.empty}>No folders yet. Create one!</p>
            ) : (
                rootFolders.map(folder => renderFolder(folder))
            )}
        </div>
    );
};

const styles = {
    tree: {
        marginTop: '10px'
    },
    folderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px',
        marginBottom: '5px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    folderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    expandIcon: {
        cursor: 'pointer',
        fontSize: '10px',
        userSelect: 'none'
    },
    folderActions: {
        display: 'flex',
        gap: '5px'
    },
    actionBtn: {
        padding: '2px 6px',
        fontSize: '12px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer'
    },
    deleteBtn: {
        padding: '2px 6px',
        fontSize: '12px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer'
    },
    subfolderInput: {
        display: 'flex',
        gap: '5px',
        marginBottom: '10px'
    },
    input: {
        flex: 1,
        padding: '6px',
        fontSize: '12px',
        border: '1px solid #ddd',
        borderRadius: '3px'
    },
    createBtn: {
        padding: '6px 10px',
        fontSize: '12px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer'
    },
    cancelBtn: {
        padding: '6px 10px',
        fontSize: '12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer'
    },
    empty: {
        color: '#999',
        fontSize: '14px',
        textAlign: 'center',
        marginTop: '20px'
    }
};

export default FolderTree;