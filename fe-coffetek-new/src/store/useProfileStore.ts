import { create } from "zustand";
import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";

interface Order {
  id: number;
  final_price?: number;
  total_price?: number;
  original_price?: number;
  created_at: string;
  status?: string;
  note?: string;
  invoiceUrl?: string | null;
  order_details?: any[];
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

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  orders: Order[];
  wishlist: WishlistItem[];
  loyalty: Loyalty;
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

      // 🟠 Kiểm tra token hết hạn
      if (res.status === 401) {
        toast.warning("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem("USER");
        set({ user: null, loading: false });
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();

      console.log("PROFILE URL:", API_ENDPOINTS.USER.PROFILE);
      console.log("PROFILE DATA:", data);

      // Fetch user profile data
      const userData = {
        id: data.id,
        phone_number: data.phone_number,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        avatar: data.detail?.avatar_url || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&auto=format",
        birthday: data.detail?.birthday,
        sex: data.detail?.sex,
        address: data.detail?.address,
        roles: data.roles?.map((r: any) => r.role_name),
      };

      // Fetch order history using the new endpoint
      let ordersData: Order[] = [];
      try {
        const orderHistoryRes = await orderService.getOrderHistoryByCustomer(
          data.phone_number,
          1,
          100 // Get up to 100 orders
        );
        ordersData = orderHistoryRes.data || [];
      } catch (orderError) {
        console.error("Error fetching order history:", orderError);
        // Fallback to orders from profile if available
        ordersData = data.orders || [];
      }

      set({
        user: userData,
        orders: ordersData,
        wishlist: data.wishlist || [],
        loyalty: data.loyalty || { points: 0 },
        loading: false,
      });
    } catch (err: any) {
      console.error("Fetch profile error:", err);
      set({ error: err.message, loading: false });
    }
  },
}));
