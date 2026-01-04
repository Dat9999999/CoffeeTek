'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // Cài thêm: npm install framer-motion

export default function KioskIdlePage() {
  const router = useRouter();

  return (
    <div 
      className="relative h-full w-full flex items-center justify-center bg-black"
      onClick={() => router.push('/kiosk/menu')}
    >
      {/* Background Video/Image */}
      <div className="absolute inset-0 opacity-60">
        <img 
          src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop" 
          alt="Coffee Background" 
          className="h-full w-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-6xl font-bold tracking-tight">COFFEE TEK</h1>
          <p className="text-xl font-light text-gray-200">Experience tech coffee</p>
        </motion.div>

        {/* Pulse effect button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="px-12 py-6 bg-orange-600 rounded-full text-2xl font-bold shadow-2xl hover:bg-orange-500 transition-colors border-4 border-orange-400/30 backdrop-blur-sm"
        >
          TAP TO START
        </motion.button>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center w-full text-white/50 text-sm">
        Powered by CoffeeTek Enterprise System
      </div>
    </div>
  );
}