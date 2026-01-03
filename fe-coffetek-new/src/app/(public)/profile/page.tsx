"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import EditProfileForm from "@/components/features/profile/EditProfileForm";
import FaceIDRegistration from "@/components/features/profile/FaceIDRegistration";
import { useAuth } from "@/hooks/useAuth"; // ✅ import hook kiểm tra đăng nhập

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth(true); // true = auto redirect nếu chưa login

  const { user, orders, wishlist, loyalty, fetchProfile, loading, error } =
    useProfileStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "orders" | "wishlist" | "loyalty"
  >("profile");

  // ✅ Khi đã xác thực xong thì mới fetch thông tin người dùng
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  // ⏳ Đang kiểm tra token hoặc load user
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Đang tải thông tin...
      </div>
    );
  }

  // ❌ Nếu có lỗi khi lấy thông tin user
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* SIDEBAR NAVIGATION */}
          <aside className="bg-gray-50 lg:w-64 border-b lg:border-b-0 lg:border-r p-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Tài khoản của tôi
            </h2>
            <nav className="mt-6 flex flex-row lg:flex-col gap-2 overflow-x-auto">
              {[
                { id: "profile", label: "Thông tin cá nhân" },
                { id: "orders", label: "Lịch sử mua hàng" },
                { id: "wishlist", label: "Wishlist" },
                { id: "loyalty", label: "Điểm tích lũy" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-left px-4 py-2 rounded-lg transition w-full whitespace-nowrap
                    ${activeTab === tab.id
                      ? "bg-green-100 text-green-700 font-medium ring-1 ring-green-300"
                      : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <section className="flex-1 p-8">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INFO */}
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Thông tin cá nhân
                  </h3>
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
                            {user.last_name} {user.first_name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">{user.phone_number}</p>
                        </div>
                      </div>
                      <div className="text-base text-gray-700 space-y-5">
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
                    <p>Không tìm thấy thông tin người dùng.</p>
                  )}
                </div>

                {/* FORM CHỈNH SỬA */}
                <div className="border-l pl-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Cập nhật thông tin
                  </h3>
                  <EditProfileForm />
                  </div>
                </div>

                {/* FACE ID REGISTRATION */}
                <div className="border-t pt-8">
                  <FaceIDRegistration />
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Lịch sử mua hàng
                </h3>
                {orders?.length ? (
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

            {/* WISHLIST TAB
            {activeTab === "wishlist" && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Wishlist</h3>
                {wishlist?.length ? (
                  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlist.map((item: any) => (
                      <li
                        key={item.id}
                        className="border rounded-xl p-3 text-center shadow-sm hover:shadow-md transition"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover mx-auto rounded-md"
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
            )} */}

            {/* LOYALTY TAB */}
            {activeTab === "loyalty" && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Điểm tích lũy</h3>
                {loyalty ? (
                  <div className="text-lg">
                    Bạn hiện có{" "}
                    <span className="font-bold text-amber-600">
                      {loyalty.points}
                    </span>{" "}
                    điểm.
                  </div>
                ) : (
                  <p>Chưa có điểm tích lũy.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
