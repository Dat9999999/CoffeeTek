"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import EditProfileForm from "@/components/features/profile/EditProfileForm";
import FaceIDRegistration from "@/components/features/profile/FaceIDRegistration";
import OrderHistory from "@/components/features/profile/OrderHistory";
import Loyalty from "@/components/features/profile/Loyalty";
import { useAuth } from "@/hooks/useAuth"; // ✅ Import hook to check authentication

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth(true); // true = auto redirect if not logged in

  const { user, orders, loyalty, fetchProfile, loading, error } =
    useProfileStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "orders" | "loyalty"
  >("profile");

  // ✅ Fetch user information only after authentication is complete
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  // ⏳ Checking token or loading user
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  // ❌ If there's an error fetching user information
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
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
              My Account
            </h2>
            <nav className="mt-6 flex flex-row lg:flex-col gap-2 overflow-x-auto">
              {[
                { id: "profile", label: "Personal Information" },
                { id: "orders", label: "Order History" },
                { id: "loyalty", label: "Loyalty Points" },
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
                    Personal Information
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
                          <span className="font-medium">Date of Birth:</span>{" "}
                          {user.birthday
                            ? new Date(user.birthday).toLocaleDateString("en-US")
                            : "Not updated"}
                        </p>
                        <p>
                          <span className="font-medium">Gender:</span>{" "}
                          {user.sex || "Not updated"}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {user.address || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium">Roles:</span>{" "}
                          {user.roles?.join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p>User information not found.</p>
                  )}
                </div>

                {/* EDIT FORM */}
                <div className="border-l pl-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Update Information
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
              <OrderHistory orders={orders || []} />
            )}


            {/* LOYALTY TAB */}
            {activeTab === "loyalty" && (
              <Loyalty loyalty={loyalty} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
