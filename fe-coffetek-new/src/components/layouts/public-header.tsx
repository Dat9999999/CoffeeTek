'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User } from 'lucide-react'  // ✅ Thêm icon User
import { STORAGE_KEYS } from '@/lib/constant/storageKey.constant'
import { RoleNavigationButtons } from '../commons/RoleNavigationButtons'

const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // ✅ Kiểm tra token mỗi khi component mount
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    setIsLoggedIn(!!token)

    // ✅ Cập nhật trạng thái khi login/logout ở nơi khác
    const handleStorageChange = () => {
      const newToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      setIsLoggedIn(!!newToken)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    setIsLoggedIn(false)
    window.location.href = '/' // reload lại để reset UI
  }

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/image/logo.jpg"
              alt="logo"
              width={150}
              height={150}
              className="w-auto h-18 md:h-20"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-coffee-600 font-medium">Home</Link>
            <Link href="/menu" className="hover:text-coffee-600 font-medium">Menu</Link>
            <Link href="/about" className="hover:text-coffee-600 font-medium">About Us</Link>
            <Link href="/promotions" className="hover:text-coffee-600 font-medium">Promotion</Link>
            <Link href="/contact" className="hover:text-coffee-600 font-medium">Contact</Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">

            {!isLoggedIn ? (
              <>
                <Button variant="outline" className="px-6">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button className="px-6">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <>
                <RoleNavigationButtons />
                {/* ✅ Thêm icon user */}
                <Link
                  href="/profile"
                  className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition"
                  title="Trang cá nhân"
                >
                  <User className="h-6 w-6 text-coffee-600" />
                </Link>

                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">

              {['Home', 'Menu', 'About Us', 'Shop', 'Contact'].map((item, i) => (
                <Link
                  key={i}
                  href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s/g, '')}`}
                  className="block px-3 py-2 rounded-md font-medium hover:text-coffee-600 hover:bg-gray-50"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 space-y-2">
              {!isLoggedIn ? (
                <>
                  <Button variant="outline" className="w-full">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button className="w-full">
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <>
                  <RoleNavigationButtons />

                  {/* ✅ Thêm icon user ở menu mobile */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    <User className="h-5 w-5 text-coffee-600" />
                    <span>Trang cá nhân</span>
                  </Link>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default PublicHeader
