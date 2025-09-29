"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FormContainer({
  title,
  description,
  link,
  children,
  footer,
}: any) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-[url(/image/login_background.jpg)] bg-cover">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white/30 backdrop-blur-md border border-white/20 shadow-xl animate-fadeSlide">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 drop-shadow">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-gray-700">
                {description}
              </CardDescription>
            )}
            {link}
          </CardHeader>

          <CardContent>{children}</CardContent>

          {footer && (
            <CardFooter className="flex-col gap-2 px-0">{footer}</CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
