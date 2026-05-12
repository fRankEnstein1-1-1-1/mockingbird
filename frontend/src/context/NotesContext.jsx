import React, { createContext, useState } from 'react';
import API from '../utils/api';

export const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
    const [folders, setFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);   // renamed for clarity

    // FOLDERS
    const fetchFolders = async () => {
        const res = await API.get('/folder');
        setFolders(res.data || []);
        return res.data;
    };

    const createFolder = async (name, parentId = null) => {
        const res = await API.post('/folder', { name, parentId });
        setFolders(prev => [...prev, res.data]);
        return res.data;
    };

    const deleteFolder = async (folderId) => {
        await API.delete(`/folder/${folderId}`);
        setFolders(prev => prev.filter(f => f._id !== folderId));
    };

    // NOTES
    const fetchNotes = async (folderId) => {
        try {
            const res = await API.get(`/notes/folder/${folderId || 'root'}`); // better route handling
            setNotes(res.data || []);
            return res.data;
        } catch (err) {
            console.error(err);
            setNotes([]);
            return [];
        }
    };

    const createNote = async (folderId, title, text) => {
        const res = await API.post('/notes', { folderId, title, text: text || '' });
        setNotes(prev => [...prev, res.data]);
        return res.data;
    };

    const updateNote = async (noteId, title, text) => {
        const res = await API.put(`/notes/${noteId}`, { title, text: text || '' });
        setNotes(prev => prev.map(n => n._id === noteId ? res.data : n));
        setSelectedNote(res.data);
        return res.data;
    };

    const deleteNote = async (noteId) => {
        await API.delete(`/notes/${noteId}`);
        setNotes(prev => prev.filter(n => n._id !== noteId));
        setSelectedNote(null);
    };

    // IMAGE UPLOAD - FIXED
    const uploadImage = async (noteId, file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await API.post(`/upload/image/${noteId}`, formData);
        
        // Important: Update both lists
        const updatedNote = res.data.note || res.data;
        setNotes(prev => prev.map(n => n._id === noteId ? updatedNote : n));
        setSelectedNote(updatedNote);
        
        return updatedNote;
    };

    // VOICE UPLOAD - FIXED
    const uploadVoice = async (noteId, file) => {
        const formData = new FormData();
        formData.append('voice', file);

        const res = await API.post(`/upload/voice/${noteId}`, formData);
        
        const updatedNote = res.data.note || res.data;
        setNotes(prev => prev.map(n => n._id === noteId ? updatedNote : n));
        setSelectedNote(updatedNote);
        
        return updatedNote;
    };

    return (
        <NotesContext.Provider value={{
            folders,
            notes,
            selectedNote,
            setSelectedNote,
            fetchFolders,
            createFolder,
            deleteFolder,
            fetchNotes,
            createNote,
            updateNote,
            deleteNote,
            uploadImage,
            uploadVoice,
        }}>
            {children}
        </NotesContext.Provider>
    );
};