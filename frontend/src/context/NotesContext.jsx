import React, { createContext, useState } from 'react';
import API from '../utils/api';

export const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);

    // FOLDERS
    const fetchFolders = async () => {
        const res = await API.get('/folder');
        setFolders(res.data);
        return res.data;
    };

    const createFolder = async (name, parentId = null) => {
        const res = await API.post('/folder', { name, parentId });
        setFolders([...folders, res.data]);
        return res.data;
    };

    const deleteFolder = async (folderId) => {
        await API.delete(`/folder/${folderId}`);
        setFolders(folders.filter(f => f._id !== folderId));
    };

    // NOTES
    const fetchNotes = async (folderId) => {
        const res = await API.get(`/notes/folder/${folderId}`);
        setNotes(res.data);
        return res.data;
    };

    const createNote = async (folderId, title, text) => {
        const res = await API.post('/notes', { folderId, title, text });
        setNotes([...notes, res.data]);
        return res.data;
    };

    const updateNote = async (noteId, title, text) => {
        const res = await API.put(`/notes/${noteId}`, { title, text });
        setNotes(notes.map(n => n._id === noteId ? res.data : n));
        setCurrentNote(res.data);
        return res.data;
    };

    const deleteNote = async (noteId) => {
        await API.delete(`/notes/${noteId}`);
        setNotes(notes.filter(n => n._id !== noteId));
        setCurrentNote(null);
    };

    // IMAGE UPLOAD
    const uploadImage = async (noteId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await API.post(`/upload/image/${noteId}`, formData);
        setCurrentNote(res.data.note);
        return res.data;
    };

    // VOICE UPLOAD
    const uploadVoice = async (noteId, file) => {
        const formData = new FormData();
        formData.append('voice', file);
        const res = await API.post(`/upload/voice/${noteId}`, formData);
        setCurrentNote(res.data.note);
        return res.data;
    };

    // ANNOTATIONS
    const addAnnotation = async (noteId, annotation) => {
        const res = await API.post(`/notes/${noteId}/annotation`, { annotation });
        setCurrentNote(res.data.note);
        return res.data;
    };

    const updateAnnotations = async (noteId, annotations) => {
        const res = await API.put(`/notes/${noteId}/annotations`, { annotations });
        setCurrentNote(res.data.note);
        return res.data;
    };

    return (
        <NotesContext.Provider value={{
            folders, currentFolder, setCurrentFolder,
            notes, currentNote, setCurrentNote,
            fetchFolders, createFolder, deleteFolder,
            fetchNotes, createNote, updateNote, deleteNote,
            uploadImage, uploadVoice,
            addAnnotation, updateAnnotations
        }}>
            {children}
        </NotesContext.Provider>
    );
};