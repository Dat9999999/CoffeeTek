"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react"; // icon đẹp từ lucide-react

export default function BackButton({ label = "Quay lại" }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-100 transition"
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}
