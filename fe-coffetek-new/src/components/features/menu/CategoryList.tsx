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
    <div className="flex gap-4 justify-center">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/menu/${cat.slug}`}
          className="px-4 py-2 border rounded hover:bg-gray-100 capitalize"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
