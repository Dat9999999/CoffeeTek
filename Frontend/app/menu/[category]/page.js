import { menuItems } from "@/lib/menuData";
import MenuItemCard from "@/components/menu/MenuItemCard";
import Link from "next/link";

export default function CategoryPage({ params }) {
  const { category } = params;
  const filtered = menuItems.filter(item => item.category === category);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold capitalize">{category}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {filtered.map((item) => (
          <Link key={item.id} href={`/menu/item/${item.id}`}>
            <MenuItemCard key={item.id} {...item} />
          </Link>
        ))}
      </div>
    </div>
  );
}
