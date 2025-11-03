"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fffaf5] text-gray-800">
      {/* --- Hero Section --- */}
      <section className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/image/contact-hero.jpg"
          alt="Coffee contact background"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Get in Touch
          </h1>
          <p className="text-lg font-light">
            We'd love to hear from you ☕
          </p>
        </div>
      </section>

      {/* --- Contact Info --- */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white rounded-xl shadow"
          >
            <h3 className="text-xl font-semibold mb-2 text-[#4a2c2a]">
              📍 Address
            </h3>
            <p className="text-gray-700">
              123 Coffee Street, District 1<br />Ho Chi Minh City, Vietnam
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white rounded-xl shadow"
          >
            <h3 className="text-xl font-semibold mb-2 text-[#4a2c2a]">
              ☎️ Contact
            </h3>
            <p className="text-gray-700">
              (+84) 123 456 789 <br /> hello@coffeeandbake.vn
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white rounded-xl shadow"
          >
            <h3 className="text-xl font-semibold mb-2 text-[#4a2c2a]">
              ⏰ Opening Hours
            </h3>
            <p className="text-gray-700">
              Mon – Sun: 7:00 AM – 10:00 PM
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Contact Form --- */}
      <section className="bg-[#f6eee7] py-16">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#4a2c2a]">
            Send Us a Message
          </h2>
          <p className="text-gray-600 mb-8">
            Have a question, suggestion, or feedback? Fill out the form below —
            we’ll get back to you soon!
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Message sent successfully! (Demo only)");
            }}
            className="space-y-5 text-left"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-[#4a2c2a]">
                Your Name
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[#4a2c2a]">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[#4a2c2a]">
                Message
              </label>
              <textarea
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#4a2c2a] text-white font-semibold rounded-lg shadow hover:bg-[#3a201e] transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* --- Map / Image --- */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-[#4a2c2a]">Find Us</h2>
        <div className="w-full h-[300px] md:h-[400px] relative rounded-xl overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.481929234834!2d106.70042327573652!3d10.774956059289514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3e0df6a21d%3A0xb9bdf9d8e0d0bb94!2sDistrict%201%2C%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2s!4v1697292708269!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
