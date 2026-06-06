import axios from 'axios';

const getApiBaseUrl = () => {
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    return isLocalhost ? 'http://localhost:5000/api' : '/api';
};

const api = axios.create({
    baseURL: getApiBaseUrl()
});

api.interceptors.request.use((config) => {
    const url = config.url || '';
    const isAdminRoute = url.startsWith('/admin') || url.includes('/admin/');
    const token = isAdminRoute
        ? sessionStorage.getItem('adminToken')
        : (localStorage.getItem('customerToken') || sessionStorage.getItem('adminToken'));

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const path = window.location.pathname;

        if (status === 401 || status === 403) {
            if (path.startsWith('/admin/painel')) {
                sessionStorage.removeItem('adminToken');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminAuth');
                window.location.href = '/admin';
            } else if (path.startsWith('/minha-conta')) {
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerUser');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
