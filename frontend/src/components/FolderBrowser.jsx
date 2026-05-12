import React, { useState, useContext } from 'react';
import { NotesContext } from '../context/NotesContext';
import CreateFolderModal from './CreateFolderModal';
import CreateNoteModal from './CreateNoteModal';

const FolderBrowser = ({ 
    folders, 
    selectedFolder, 
    selectedSubfolder, 
    onSelectFolder, 
    onSelectSubfolder, 
    onSelectNote,
    onCreateComplete 
}) => {
    const { fetchNotes, notes, setCurrentFolder } = useContext(NotesContext);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [showCreateNote, setShowCreateNote] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get all parent folders (no parentId)
    const parentFolders = folders.filter(f => !f.parentId);

    // Get subfolders of selected parent
    const getSubfolders = (parentId) => {
        return folders.filter(f => f.parentId === parentId);
    };

    // Get notes for selected subfolder
    const loadNotes = async (subfolder) => {
        setLoading(true);
        await fetchNotes(subfolder._id);
        setSelectedNotes(notes);
        setLoading(false);
        onSelectSubfolder(subfolder);
    };

    const handleNoteClick = (note) => {
        onSelectNote(note);
    };

    return (
        <div style={styles.container}>
            {/* Step 1: Select Parent Folder */}
            {!selectedFolder && (
                <div style={styles.step}>
                    <div style={styles.stepHeader}>
                        <span style={styles.stepNumber}>1</span>
                        <h3 style={styles.stepTitle}>Select a Parent Folder</h3>
                    </div>
                    <div style={styles.folderGrid}>
                        {parentFolders.map(folder => (
                            <div
                                key={folder._id}
                                style={styles.folderCard}
                                onClick={() => onSelectFolder(folder)}
                            >
                                <div style={styles.folderIcon}>📁</div>
                                <div style={styles.folderName}>{folder.name}</div>
                                <div style={styles.folderInfo}>
                                    {getSubfolders(folder._id).length} subfolders
                                </div>
                            </div>
                        ))}
                        {parentFolders.length === 0 && (
                            <div style={styles.emptyState}>
                                <p>No folders yet. Create your first folder!</p>
                                <button 
                                    onClick={() => setShowCreateFolder(true)}
                                    style={styles.createFirstBtn}
                                >
                                    + Create Folder
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Select Subfolder */}
            {selectedFolder && !selectedSubfolder && (
                <div style={styles.step}>
                    <div style={styles.stepHeader}>
                        <span style={styles.stepNumber}>2</span>
                        <h3 style={styles.stepTitle}>
                            Select a Subfolder in "{selectedFolder.name}"
                        </h3>
                        <button 
                            onClick={() => onSelectFolder(null)}
                            style={styles.backBtn}
                        >
                            ← Back
                        </button>
                    </div>
                    
                    <div style={styles.actionButtons}>
                        <button 
                            onClick={() => setShowCreateFolder(true)}
                            style={styles.createSubfolderBtn}
                        >
                            + Create New Subfolder
                        </button>
                    </div>

                    <div style={styles.folderGrid}>
                        {getSubfolders(selectedFolder._id).map(subfolder => (
                            <div
                                key={subfolder._id}
                                style={styles.folderCard}
                                onClick={() => loadNotes(subfolder)}
                            >
                                <div style={styles.folderIcon}>📂</div>
                                <div style={styles.folderName}>{subfolder.name}</div>
                            </div>
                        ))}
                        {getSubfolders(selectedFolder._id).length === 0 && (
                            <div style={styles.emptyState}>
                                <p>No subfolders in this folder.</p>
                                <p style={styles.hint}>Create a subfolder to organize your notes!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Show Notes in Selected Subfolder */}
            {selectedSubfolder && (
                <div style={styles.step}>
                    <div style={styles.stepHeader}>
                        <span style={styles.stepNumber}>3</span>
                        <h3 style={styles.stepTitle}>
                            Notes in "{selectedSubfolder.name}"
                        </h3>
                        <div style={styles.navButtons}>
                            <button 
                                onClick={() => onSelectSubfolder(null)}
                                style={styles.backBtn}
                            >
                                ← Back to Subfolders
                            </button>
                            <button 
                                onClick={() => setShowCreateNote(true)}
                                style={styles.createNoteBtn}
                            >
                                + Create New Note
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading notes...</div>
                    ) : (
                        <div style={styles.notesGrid}>
                            {selectedNotes.length > 0 ? (
                                selectedNotes.map(note => (
                                    <div
                                        key={note._id}
                                        style={styles.noteCard}
                                        onClick={() => handleNoteClick(note)}
                                    >
                                        <div style={styles.noteIcon}>📄</div>
                                        <div style={styles.noteTitle}>{note.title}</div>
                                        <div style={styles.notePreview}>
                                            {note.content?.text?.substring(0, 60)}...
                                        </div>
                                        <div style={styles.noteMeta}>
                                            {note.content?.images?.length > 0 && '🖼️ '}
                                            {note.content?.voiceNotes?.length > 0 && '🎤 '}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyState}>
                                    <p>No notes in this folder.</p>
                                    <button 
                                        onClick={() => setShowCreateNote(true)}
                                        style={styles.createFirstBtn}
                                    >
                                        Create your first note
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {showCreateFolder && (
                <CreateFolderModal
                    parentFolderId={selectedFolder?._id || null}
                    onClose={() => setShowCreateFolder(false)}
                    onCreated={() => {
                        setShowCreateFolder(false);
                        onCreateComplete();
                    }}
                />
            )}

            {showCreateNote && (
                <CreateNoteModal
                    folderId={selectedSubfolder._id}
                    onClose={() => setShowCreateNote(false)}
                    onCreated={(note) => {
                        setShowCreateNote(false);
                        loadNotes(selectedSubfolder);
                        onSelectNote(note);
                    }}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        height: '100%',
        overflowY: 'auto',
        padding: '20px'
    },
    step: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    stepHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f0f0f0'
    },
    stepNumber: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    stepTitle: {
        margin: 0,
        color: '#333',
        flex: 1
    },
    folderGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
    },
    folderCard: {
        padding: '20px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
        backgroundColor: '#fafafa'
    },
    notesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
    },
    noteCard: {
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: 'white',
        position: 'relative'
    },
    noteTitle: {
        fontWeight: 'bold',
        fontSize: '16px',
        marginTop: '10px',
        color: '#333'
    },
    notePreview: {
        fontSize: '12px',
        color: '#666',
        marginTop: '8px'
    },
    noteMeta: {
        marginTop: '10px',
        fontSize: '14px'
    },
    actionButtons: {
        marginBottom: '20px',
        display: 'flex',
        gap: '10px'
    },
    navButtons: {
        display: 'flex',
        gap: '10px'
    },
    backBtn: {
        padding: '6px 12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    createSubfolderBtn: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    createNoteBtn: {
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    createFirstBtn: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '10px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: '#999'
    },
    hint: {
        fontSize: '12px',
        marginTop: '5px'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#666'
    },
    folderIcon: {
        fontSize: '48px',
        marginBottom: '10px'
    },
    noteIcon: {
        fontSize: '32px'
    },
    folderName: {
        fontWeight: '500',
        marginTop: '10px'
    },
    folderInfo: {
        fontSize: '12px',
        color: '#666',
        marginTop: '5px'
    }
};

export default FolderBrowser;