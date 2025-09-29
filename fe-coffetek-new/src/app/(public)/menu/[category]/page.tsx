import { menuItems } from "@/lib/menuData";
import MenuItemCard from "@/components/features/menu/MenuItemCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage({ params }: any) {
  const { category } = params;
  const filtered = menuItems.filter((item) => item.category === category);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container max-w-7xl mx-auto pt-4 px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold capitalize">
              {category}
            </h1>
            <p className="text-gray-500 mt-1">
              Enjoy our selection of {category} crafted just for you.
            </p>
          </div>

          <Link
            href="/menu"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </Link>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <Link key={item.id} href={`/menu/item/${item.id}`}>
                <MenuItemCard {...item} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">
            No items found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
