"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthBackLink({ href = "/auth/login", label = "Quay lại đăng nhập" }) {
  return (
    <div className="mb-4">
      <Link
        href={href}
        className="flex items-center gap-2 text-sm text-black-600 hover:underline"
      >
        <ArrowLeft size={16} />
        {label}
      </Link>
    </div>
  );
}
