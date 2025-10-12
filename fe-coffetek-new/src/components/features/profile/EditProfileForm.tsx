"use client";

import { useState, useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditProfileForm() {
  const { user, fetchProfile } = useProfileStore();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    birthday: "",
    sex: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("jwt_token");
    if (token) fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        birthday: user.birthday || "",
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
    setSuccess("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  if (!user)
    return <p className="text-center text-gray-500 mt-4">Đang tải thông tin...</p>;

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Thông tin cá nhân</CardTitle>
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </CardHeader>

      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="Họ" value={formData.last_name} />
            <ProfileField label="Tên" value={formData.first_name} />
            <ProfileField label="Email" value={formData.email} />
            <ProfileField label="Số điện thoại" value={formData.phone_number} />
            <ProfileField label="Ngày sinh" value={formatDateDisplay(formData.birthday)} />
            <ProfileField label="Giới tính" value={formData.sex || "Unknown"} />
            <ProfileField label="Địa chỉ" value={formData.address || "Unknown"} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
      </CardContent>
    </Card>
  );
}

// Subcomponent hiển thị thông tin
function ProfileField({ label, value }: any) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-base font-medium text-gray-800 truncate">
        {value || "—"}
      </span>
    </div>
  );
}

// Helper format ngày
function formatDateDisplay(date: any) {
  if (!date) return "Unknown";
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
