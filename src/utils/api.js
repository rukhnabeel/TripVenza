import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 503 Maintenance Mode
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 503) {
            // Check if we are already on the maintenance page to prevent loop
            if (!window.location.pathname.includes('/maintenance')) {
                window.location.href = '/maintenance';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
