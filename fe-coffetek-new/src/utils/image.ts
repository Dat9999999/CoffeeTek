// src/lib/utils/image.ts
export function getImageUrl(image?: string): string {
  const fallback =
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93"; // fallback mặc định
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  if (!image) return fallback;

  // Nếu đã là URL đầy đủ (http/https) thì trả nguyên
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Nếu là relative path (uploads/products/...), thì nối với BASE_URL
  if (base) {
    return `${base.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  }

  return fallback;
}
