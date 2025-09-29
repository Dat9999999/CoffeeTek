const API_ENDPOINTS = process.env.API_ENDPOINTS;

export function fetchApi(endpoint, options = {}) {
    return fetch(`${API_ENDPOINTS}${endpoint}`, options)
}