"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AppImage } from "@/components/commons/AppImage";

type MenuItemCardProps = {
  id: number;
  name: string;
  price?: number;
  image?: string;
  description?: string;
  category?: string;
};

export default function MenuItemCard({
  id,
  name,
  price,
  image,
  description,
}: MenuItemCardProps) {
  return (
    <motion.div
      className="group bg-white p-5 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 
                border border-transparent hover:border-orange-200"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="relative aspect-square mb-3 overflow-hidden rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <AppImage
          src={image}
          alt={name}
          preview={false}
          isContain={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <div className="text-center">
        <motion.h3 
          className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-orange-600 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          {name}
        </motion.h3>
        {price && (
          <motion.p 
            className="text-gray-500 font-medium mb-1"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
          >
            {price.toLocaleString()}₫
          </motion.p>
        )}
        {description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {description}
          </p>
        )}

        <Link href={`/menu/${id}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="w-full py-2 rounded-full bg-orange-600 hover:bg-orange-700 
                        text-white font-medium transition-all duration-300 
                        shadow-sm hover:shadow-md"
            >
              See details
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
