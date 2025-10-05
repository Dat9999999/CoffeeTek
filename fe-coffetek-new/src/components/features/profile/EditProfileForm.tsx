"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";

export default function EditProfileForm() {
  const { user, updateProfile } = useProfileStore();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: "",
    sex: "other",
    avatar: "default.png",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthday: user.birthday?.split("T")[0] || "", // format yyyy-mm-dd
        sex: user.sex || "other",
        avatar: user.avatar || "default.png",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await updateProfile(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-xl p-6 space-y-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-semibold">Chỉnh sửa thông tin cá nhân</h2>

      {/* First + Last name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Họ</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          disabled
          className="w-full border rounded-lg p-2 bg-gray-100 text-gray-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-1">Số điện thoại</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Birthday + Sex */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ngày sinh</label>
          <input
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Giới tính</label>
          <select
            name="sex"
            value={form.sex}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Địa chỉ</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Avatar (URL) */}
      <div>
        <label className="block text-sm font-medium mb-1">Ảnh đại diện</label>
        <input
          type="text"
          name="avatar"
          value={form.avatar}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <img
          src={form.avatar}
          alt="avatar preview"
          className="w-20 h-20 rounded-full mt-2 object-cover border"
        />
      </div>

      <button
        type="submit"
        className="bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700"
      >
        Lưu thay đổi
      </button>
    </form>
  );
}
