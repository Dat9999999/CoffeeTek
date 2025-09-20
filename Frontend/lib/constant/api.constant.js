const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        SIGNUP: `${BASE_URL}/auth/signup`,
    },
};
