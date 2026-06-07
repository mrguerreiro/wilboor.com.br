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

let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
    pendingRequests.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    pendingRequests = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const path = window.location.pathname;
        const isAdminRoute = (originalRequest.url || '').includes('/admin/');

        if (status === 401 && !originalRequest._retry && !isAdminRoute) {
            const refreshToken = localStorage.getItem('customerRefreshToken');

            if (refreshToken) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        pendingRequests.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const { data } = await axios.post(`${getApiBaseUrl()}/auth/refresh`, { refreshToken });
                    localStorage.setItem('customerToken', data.token);
                    localStorage.setItem('customerRefreshToken', data.refreshToken);
                    processQueue(null, data.token);
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return api(originalRequest);
                } catch {
                    processQueue(new Error('Sessão expirada'));
                    localStorage.removeItem('customerToken');
                    localStorage.removeItem('customerRefreshToken');
                    localStorage.removeItem('customerUser');
                    window.location.href = '/login';
                    return Promise.reject(error);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        if (status === 401 || status === 403) {
            if (path.startsWith('/tocadochefe/painel')) {
                sessionStorage.removeItem('adminToken');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminAuth');
                window.location.href = '/tocadochefe';
            } else if (path.startsWith('/minha-conta')) {
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerRefreshToken');
                localStorage.removeItem('customerUser');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
