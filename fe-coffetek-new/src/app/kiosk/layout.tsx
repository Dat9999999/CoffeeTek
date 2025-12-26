import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CoffeeTek Kiosk',
  description: 'Self-service Ordering System',
};

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 select-none touch-manipulation`}>
      {/* touch-manipulation: Tối ưu cho màn hình cảm ứng, loại bỏ delay khi tap */}
      {children}
    </div>
  );
}