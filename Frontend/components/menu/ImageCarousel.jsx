"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageCarousel({ images }) {
  const [index, setIndex] = useState(0);

  // Tự động đổi ảnh mỗi 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Chuyển trái/phải
  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-md bg-white">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`image-${i}`}
            className="w-full h-full flex-shrink-0 object-contain"
          />
        ))}
      </div>

      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              i === index ? "bg-black" : "bg-gray-300"
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
