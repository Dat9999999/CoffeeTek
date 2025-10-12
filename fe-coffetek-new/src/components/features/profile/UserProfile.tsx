"use client";
import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserProfile() {
  const { user, fetchProfile, loading, error } = useProfileStore();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    birthday: "",
    sex: "",
    address: "",
  });
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("jwt_token");
    if (!token) return;
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        birthday: formatDateInput(user.birthday) || "",
        sex: user.sex || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSuccess("");
    try {
      // await updateProfile(formData);
      setSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Đang tải thông tin...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-semibold text-gray-800">
          Thông tin cá nhân
        </h2>
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>

      {/* Avatar + email */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
          avatar
        </div>
        <div>
          <p className="text-lg font-medium text-gray-800">
            {formData.first_name} {formData.last_name}
          </p>
          <p className="text-sm text-gray-500">{formData.email}</p>
        </div>
      </div>

      {/* Hiển thị thông tin hoặc form chỉnh sửa */}
      {!isEditing ? (
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <ProfileField label="Số điện thoại" value={formData.phone_number} />
          <ProfileField label="Ngày sinh" value={formatDateDisplay(formData.birthday)} />
          <ProfileField label="Giới tính" value={formData.sex || "Unknown"} />
          <ProfileField label="Địa chỉ" value={formData.address || "Unknown"} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-4">
          <Input id="last_name" value={formData.last_name} onChange={handleChange} placeholder="Họ" />
          <Input id="first_name" value={formData.first_name} onChange={handleChange} placeholder="Tên" />
          <Input id="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          <Input id="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Số điện thoại" />
          <Input id="birthday" type="date" value={formData.birthday} onChange={handleChange} />
          <Input id="sex" value={formData.sex} onChange={handleChange} placeholder="Giới tính" />
          <Input id="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" />
          <div className="col-span-2 flex justify-end mt-4">
            <Button type="submit">Lưu thay đổi</Button>
          </div>
        </form>
      )}

      {success && (
        <p className="text-green-600 mt-4 text-sm text-right">{success}</p>
      )}
    </div>
  );
}

function ProfileField({ label, value }: any) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-base font-medium text-gray-800 truncate">
        {value || "—"}
      </span>
    </div>
  );
}

function formatDateDisplay(date: any) {
  if (!date) return "Unknown";
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatDateInput(date: any) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}
