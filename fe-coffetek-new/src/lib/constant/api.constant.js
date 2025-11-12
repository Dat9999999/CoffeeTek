// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
// export const API_ENDPOINTS = {
//     AUTH: {
//         LOGIN: `${BASE_URL}/auth/login`,
//         SIGNUP: `${BASE_URL}/auth/signup`,
//     },
// };

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
    SIGNUP: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
    CHANGE_PASSWORD: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-password`,
  },

  USER: {
    PROFILE: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`,
  },
  VOUCHER: {
    EXCHANGE: `${process.env.NEXT_PUBLIC_API_BASE_URL}/voucher`,
  },
  PROMOTION: {
    GET_ALL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/promotion`,
  },

};


