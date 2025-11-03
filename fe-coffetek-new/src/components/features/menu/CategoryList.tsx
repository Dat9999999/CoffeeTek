"use client";

import Link from "next/link";

const categories = [
  { name: "Coffee", slug: "coffee" },
  { name: "Tea", slug: "tea" },
  { name: "Bakery", slug: "bakery" },
  { name: "Others", slug: "others" },
];

export default function CategoryList() {
  return (
    <aside className="w-48 h-full bg-gray-50 border-r p-4 flex flex-col gap-2 fixed left-0 top-16">
      <h2 className="text-lg font-semibold mb-3">Menu</h2>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/menu/${cat.slug}`}
          className="px-3 py-2 rounded hover:bg-gray-200 capitalize transition"
        >
          {cat.name}
        </Link>
      ))}
    </aside>
  );
}
