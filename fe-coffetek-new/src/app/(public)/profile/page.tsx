"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import EditProfileForm from "@/components/features/profile/EditProfileForm";

export default function ProfilePage() {
  const { user, orders, wishlist, loyalty, fetchProfile, loading, error } =
    useProfileStore();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "loyalty">("profile");

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Đang tải thông tin...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl">
        {/* Tabs */}
        <div className="border-b flex">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "profile"
                ? "border-b-2 border-brown-600 text-brown-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Thông tin cá nhân
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "orders"
                ? "border-b-2 border-brown-600 text-brown-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Lịch sử mua hàng
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "wishlist"
                ? "border-b-2 border-brown-600 text-brown-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("wishlist")}
          >
            Wishlist
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "loyalty"
                ? "border-b-2 border-brown-600 text-brown-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("loyalty")}
          >
            Điểm tích lũy
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Thông tin cá nhân</h2>
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-20 h-20 rounded-full object-cover border"
                      />
                      <div>
                        <p className="text-lg font-semibold">
                          {user.lastName} {user.firstName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Ngày sinh:</span>{" "}
                        {user.birthday
                          ? new Date(user.birthday).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </p>
                      <p>
                        <span className="font-medium">Giới tính:</span>{" "}
                        {user.sex || "Chưa cập nhật"}
                      </p>
                      <p>
                        <span className="font-medium">Địa chỉ:</span>{" "}
                        {user.address || "Chưa có"}
                      </p>
                      <p>
                        <span className="font-medium">Vai trò:</span>{" "}
                        {user.roles?.join(", ")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Không tìm thấy thông tin người dùng</p>
                )}
              </div>

              {/* Form */}
              <EditProfileForm />
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Lịch sử mua hàng
              </h2>
              {orders.length > 0 ? (
                <ul className="divide-y">
                  {orders.map((order: any) => (
                    <li key={order.id} className="py-3">
                      <p className="font-medium">
                        Mã đơn: {order.id} – {order.total_price}₫
                      </p>
                      <p className="text-sm text-gray-600">
                        Ngày:{" "}
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có đơn hàng nào.</p>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
              {wishlist.length > 0 ? (
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((item: any) => (
                    <li
                      key={item.id}
                      className="border rounded-lg p-3 flex flex-col items-center"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <p className="mt-2 text-sm font-medium">{item.name}</p>
                      <p className="text-gray-600 text-sm">{item.price}₫</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Danh sách yêu thích trống.</p>
              )}
            </div>
          )}

          {activeTab === "loyalty" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Điểm tích lũy</h2>
              {loyalty ? (
                <div className="text-lg">
                  Bạn hiện có{" "}
                  <span className="font-bold text-brown-600">
                    {loyalty.points}
                  </span>{" "}
                  điểm.
                </div>
              ) : (
                <p>Chưa có điểm tích lũy.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
