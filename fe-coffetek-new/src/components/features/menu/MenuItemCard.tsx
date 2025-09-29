import Image from "next/image";
import { Button } from "@/components/ui/button";

type MenuItemCardProps = {
  id: string | number;
  name: string;
  price: number;
  image?: string; // có thể undefined
  description?: string;
};

export default function MenuItemCard({ id, name, price, image, description }: MenuItemCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out">
      {/* Image */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain rounded-md transition-transform duration-300 ease-in-out hover:scale-110"
          />
        ) : (
          <div >
          </div>
        )}

      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">${price.toFixed(2)}</p>
        {description && (
          <p className="text-sm text-gray-500 mb-4">{description}</p>
        )}

        {/* Button */}
        <Button className="w-full py-3 rounded-full bg-gray-900 text-white tracking-wide shadow-md hover:bg-gray-700 hover:scale-105 transition-all duration-300">
          ADD TO FAVORITES
        </Button>
      </div>
    </div>
  );
}
