export function getImageUrl(image?: string): string {
  const fallback =
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93";
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  if (!image) return fallback;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (base) {
    return `${base.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  }

  return fallback;
}
