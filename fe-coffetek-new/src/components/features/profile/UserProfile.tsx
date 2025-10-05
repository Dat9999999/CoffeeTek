"use client";
import React, { useState } from "react";

interface UserProfileProps {
  profile: any;
}

export default function UserProfile({ profile }: UserProfileProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [form, setForm] = useState<any>(profile);

  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold">
          {profile?.initials || "U"}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{form?.name}</h3>
          <p className="text-sm text-muted-foreground">{form?.email}</p>
          <p className="text-sm text-muted-foreground">{form?.phone}</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setEditing(!editing)}
            className="px-3 py-1 rounded-md border hover:bg-gray-50"
          >
            {editing ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      {editing ? (
        <form className="mt-6 grid grid-cols-1 gap-4 max-w-xl">
          <label className="flex flex-col">
            <span className="text-sm">Họ tên</span>
            <input
              value={form?.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 p-2 rounded border"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Email</span>
            <input
              value={form?.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 p-2 rounded border"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Số điện thoại</span>
            <input
              value={form?.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 p-2 rounded border"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded bg-amber-500 text-white"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded border"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6">
          <h4 className="font-medium">Thông tin thêm</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Ngày sinh: {profile?.birthday || "—"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Thành viên từ: {profile?.joinedAt || "—"}
          </p>
        </div>
      )}
    </div>
  );
}
