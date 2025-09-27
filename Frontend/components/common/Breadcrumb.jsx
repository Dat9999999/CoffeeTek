"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center text-sm text-gray-600 mb-6">
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-black font-medium transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight size={14} className="mx-2 text-gray-400" />
          )}
        </span>
      ))}
    </nav>
  );
}
