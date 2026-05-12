import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotesContext } from '../context/NotesContext';
import Sidebar from '../components/Sidebar';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { fetchFolders } = useContext(NotesContext);

    useEffect(() => {
        fetchFolders();
    }, []);

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h2>Notes App</h2>
                <div>
                    <span>Welcome, {user?.username}</span>
                    <button onClick={logout} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>

            {/* Main Layout */}
            <div style={styles.main}>
                <Sidebar />
                <NotesList />
                <NoteEditor />
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        backgroundColor: '#333',
        color: 'white'
    },
    logoutBtn: {
        marginLeft: '20px',
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    main: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
    }
};

export default Dashboard;