import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";
import { create } from "zustand";

interface Order {
  id: number;
  total_price: number;
  created_at: string;
}

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface Loyalty {
  points: number;
}
interface User {
  id: number;
  phone_number: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  birthday?: string;
  sex?: string;
  address?: string;
  roles?: string[];
}

interface ProfileState {
  user: User | null;
  orders: any[];
  wishlist: any[];
  loyalty: { points: number };
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updatedUser: Partial<User>) => Promise<void>;
}

interface User {
  id: number;
  phone_number: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  birthday?: string;
  sex?: string;
  address?: string;
  roles?: string[];
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  orders: any[];
  wishlist: any[];
  loyalty: { points: number };
  fetchProfile: () => Promise<void>;
}

export const useProfileStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,
  orders: [],
  wishlist: [],
  loyalty: { points: 0 },

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error("Token not found");

      const res = await fetch(API_ENDPOINTS.USER.PROFILE, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      
      console.log("PROFILE URL:", API_ENDPOINTS.USER.PROFILE);
      console.log(data);

      set({
        user: {
          id: data.id,
          phone_number: data.phone_number,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar: data.detail?.avatar_url || "default.png",
          birthday: data.detail?.birthday,
          sex: data.detail?.sex,
          address: data.detail?.address,
          roles: data.roles?.map((r: any) => r.role_name),
        },
        orders: data.orders || [],
        wishlist: data.wishlist || [],
        loyalty: data.loyalty || { points: 0 },
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },


}));





// import { create } from "zustand";

// const API_BASE = process.env.ENDPOINT_API;

// // ---- Interfaces ----
// interface Order {
//   id: number;
//   total_price: number;
//   created_at: string;
// }

// interface WishlistItem {
//   id: number;
//   name: string;
//   price: number;
//   image: string;
// }

// interface Loyalty {
//   points: number;
// }

// interface User {
//   id: number;
//   phone: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   avatar: string;
//   birthday?: string;
//   sex?: string;
//   address?: string;
//   roles?: string[];
// }

// interface ProfileState {
//   user: User | null;
//   orders: Order[];
//   wishlist: WishlistItem[];
//   loyalty: Loyalty | null;
//   loading: boolean;
//   error: string | null;
//   fetchProfile: () => Promise<void>;
//   updateProfile: (updatedUser: Partial<User>) => Promise<void>;
// }

// // ---- Store ----
// export const useProfileStore = create<ProfileState>((set) => ({
//   user: null,
//   orders: [],
//   wishlist: [],
//   loyalty: null,
//   loading: false,
//   error: null,

//   // Lấy thông tin user
//   fetchProfile: async () => {
//     try {
//       set({ loading: true, error: null });

//       const token = localStorage.getItem("jwt_token");
//       if (!token) throw new Error("Token not found");

//       const res = await fetch(`${API_BASE}/user/me`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error("Failed to fetch profile");

//       const data = await res.json();

//       set({
//         user: {
//           id: data.id,
//           phone: data.phone_number,
//           email: data.email,
//           firstName: data.first_name,
//           lastName: data.last_name,
//           avatar: data.detail?.avatar_url || "default.png",
//           birthday: data.detail?.birthday,
//           sex: data.detail?.sex,
//           address: data.detail?.address,
//           roles: data.roles?.map((r: any) => r.role_name),
//         },
//         orders: data.orders || [],
//         wishlist: data.wishlist || [],
//         loyalty: data.loyalty || { points: 0 },
//         loading: false,
//       });
//     } catch (err: any) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   // Cập nhật thông tin user
//   updateProfile: async (updatedUser: Partial<User>) => {
//     try {
//       const token = localStorage.getItem("jwt_token");
//       if (!token) throw new Error("Token not found");

//       const res = await fetch(`${API_BASE}/user/update`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(updatedUser),
//       });

//       if (!res.ok) throw new Error("Failed to update profile");

//       const data = await res.json();

//       set({
//         user: {
//           id: data.id,
//           phone: data.phone_number,
//           email: data.email,
//           firstName: data.first_name,
//           lastName: data.last_name,
//           avatar: data.detail?.avatar_url || "default.png",
//           birthday: data.detail?.birthday,
//           sex: data.detail?.sex,
//           address: data.detail?.address,
//           roles: data.roles?.map((r: any) => r.role_name),
//         },
//       });
//     } catch (err: any) {
//       set({ error: err.message });
//     }
//   },
// }));
