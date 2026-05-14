import axios from 'axios';

const API = axios.create({
    baseURL: 'https://mockingbird-joc8.onrender.com/api'
});
// http://localhost:5000
//https://mockingbird-joc8.onrender.com
// Add token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;