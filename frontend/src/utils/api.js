import axios from 'axios';

const API = axios.create({
    baseURL: 'https://mockingbird-joc8.onrender.com/api'
});

// Add token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;