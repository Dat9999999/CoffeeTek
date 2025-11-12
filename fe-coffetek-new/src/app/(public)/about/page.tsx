"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fffaf5] text-gray-800">
      {/* --- Hero Section --- */}
      <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/image/about-hero.jpg"
          alt="Coffee background"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wide">
            About Coffee & Bake
          </h1>
          <p className="text-lg md:text-xl font-light">
            Where every sip tells a story ☕
          </p>
        </div>
      </section>

      {/* --- Our Story --- */}
      <section className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-[#4a2c2a]">
            Our Story
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Founded in 2021, <span className="font-semibold">Coffee & Bake</span> began as a small dream — to bring together
            the art of brewing coffee and the warmth of homemade pastries.
            We believe that every cup of coffee tells a story — one of patience,
            passion, and connection.
          </p>
          <p className="text-gray-700 leading-relaxed">
            From carefully sourced beans to freshly baked goods every morning,
            we pour our hearts into crafting a cozy experience for every visitor.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg"
        >
          <Image
            src="/image/our-story.jpg"
            alt="Our coffee shop"
            fill
            className="object-cover"
          />
        </motion.div>
      </section>

      {/* --- Our Values --- */}
      <section className="bg-[#f6eee7] py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12 text-[#4a2c2a]">
            Our Values
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Quality Beans",
                desc: "We source premium Arabica beans for the best aroma and flavor.",
                icon: "☕",
              },
              {
                title: "Warm Atmosphere",
                desc: "A cozy space for coffee lovers to relax, work, and connect.",
                icon: "🏠",
              },
              {
                title: "Crafted Pastries",
                desc: "Freshly baked treats that complement every sip of coffee.",
                icon: "🥐",
              },
              {
                title: "Community Love",
                desc: "We believe coffee brings people closer together.",
                icon: "❤️",
              },
            ].map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 bg-white rounded-xl shadow hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{val.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-[#4a2c2a]">
                  {val.title}
                </h3>
                <p className="text-gray-600 text-sm">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Visit Us --- */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-[#4a2c2a]">
          Visit Us
        </h2>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
          Drop by our cozy shop in the heart of the city and enjoy your favorite
          brew. Whether you're here for a quick espresso or a slow Sunday
          morning, we’ll be happy to serve you.
        </p>
        <div className="w-full h-[300px] md:h-[400px] relative rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/image/coffee-shop-interior.jpg"
            alt="Coffee & Bake shop interior"
            fill
            className="object-cover"
          />
        </div>

        <div className="mt-6 text-gray-600">
          <p>📍 123 Coffee Street, District 1, Ho Chi Minh City</p>
          <p>⏰ Open daily: 7:00 AM – 10:00 PM</p>
        </div>
      </section>
    </div>
  );
}
