import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SocialIcon } from 'react-social-icons'

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About Section */}
          <div className="space-y-4">
            <Image 
              src="/image/logo.png" 
              alt="logo" 
              width={150} 
              height={50}
              className="mb-4" 
            />
            <p className="text-gray-600 text-sm leading-relaxed">
              We are a team of professional cooks who are excited about their food, amazing skills and experience and expertise.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span>8:00 am - 9:00 pm</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>8:00 am - 9:00 pm</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>CLOSED</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-600">
              <li>+1 123 456 7890</li>
              <li>coffee@alowishus.com.au</li>
              <li>123 Coffee Street, Brisbane,<br />QLD Australia</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe to our newsletter to get the latest updates and news.
            </p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-600"
              />
              <button 
                type="submit"
                className="w-full bg-coffee-600 text-white px-4 py-2 rounded-md hover:bg-coffee-700 transition duration-300"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-600">
              © 2024 Alowishus Delicious Coffee. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <SocialIcon 
                url="https://facebook.com" 
                bgColor="#666666"
                fgColor="#ffffff"
                className="hover:scale-110 transition-transform"
                style={{ height: 35, width: 35 }}
              />
              <SocialIcon 
                url="https://twitter.com" 
                bgColor="#666666"
                fgColor="#ffffff"
                className="hover:scale-110 transition-transform"
                style={{ height: 35, width: 35 }}
              />
              <SocialIcon 
                url="https://instagram.com" 
                bgColor="#666666"
                fgColor="#ffffff"
                className="hover:scale-110 transition-transform"
                style={{ height: 35, width: 35 }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer