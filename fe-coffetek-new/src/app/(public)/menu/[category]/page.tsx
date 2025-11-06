import { menuItems } from "@/lib/menuData";
import MenuItemCard from "@/components/features/menu/MenuItemCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  const filteredItems = menuItems.filter(
    (item) => item.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto pt-4 px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold capitalize">
              {category.replace("-", " ")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Enjoy our selection of {category} crafted just for you.
            </p>
          </div>

          <Link
            href="/menu"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </Link>
        </div>

        {/* Content */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                id={Number(item.id)}
                name={item.name}
                price={item.price}
                image={item.image}
                category={item.category}
                description={item.description}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">
            No items found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
