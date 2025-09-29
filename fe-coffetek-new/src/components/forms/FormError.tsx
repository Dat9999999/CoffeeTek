"use client";

export default function FormError({ message }: any) {
  if (!message) return null;

  return <p className="text-red-500 text-sm mt-1">{message}</p>;
}
