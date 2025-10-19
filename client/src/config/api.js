const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api'

export const apiConfig = {
    baseURL: API_BASE_URL,
    timeout: 10000,
}

export const endpoints = {
    projects: {
        getAll: () => `${API_BASE_URL}/projects`,
        getById: (id) => `${API_BASE_URL}/projects/${id}`,
        create: () => `${API_BASE_URL}/projects`,
        update: (id) => `${API_BASE_URL}/projects/${id}`,
        delete: (id) => `${API_BASE_URL}/projects/${id}`,
    },
    users: {
        getAll: () => `${API_BASE_URL}/users`,
        getById: (id) => `${API_BASE_URL}/users/${id}`,
        create: () => `${API_BASE_URL}/users`,
        update: (id) => `${API_BASE_URL}/users/${id}`,
        delete: (id) => `${API_BASE_URL}/users/${id}`,
    }
}