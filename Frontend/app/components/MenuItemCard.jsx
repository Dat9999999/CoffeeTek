import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function MenuItemCard({ id, name, price, image, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
      <div className="relative aspect-square mb-4">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain rounded-md shadow-lg shadow-gray-300"
        />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">${price.toFixed(2)}</p>
        {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
        <Button className="w-full py-3 rounded-full bg-gray-900 hover:bg-gray-700 transition-colors">
          ADD TO CART
        </Button>
      </div>
    </div>
  );
}
