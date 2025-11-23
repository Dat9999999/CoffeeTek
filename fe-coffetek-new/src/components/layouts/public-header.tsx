'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { STORAGE_KEYS } from '@/lib/constant/storageKey.constant'
import { RoleNavigationButtons } from '../commons/RoleNavigationButtons'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'  // ShadCN AlertDialog
import { useAuthContext } from '@/contexts/AuthContext'
import { authService } from '@/services'

const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const { setIsAuthenticated, setUser } = useAuthContext();

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    setIsLoggedIn(!!token)

    const handleStorageChange = () => {
      const newToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      setIsLoggedIn(!!newToken)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = () => {
    // Đóng dialog và menu (nếu đang mở trên mobile)
    setIsLogoutDialogOpen(false)
    setIsMenuOpen(false)

    toast.success("Logout success!")

    // Gọi service logout và truyền vào các hàm setter state từ context
    // Service sẽ lo việc xóa localStorage, set state về null/false và redirect
    authService.logout(setUser, setIsAuthenticated);
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
            <Link href="/promotions" className="hover:text-coffee-600 font-medium">Promotion</Link>
            <Link href="/about" className="hover:text-coffee-600 font-medium">About Us</Link>
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
                <Link
                  href="/profile"
                  className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition"
                  title="Trang cá nhân"
                >
                  <User className="h-6 w-6 text-coffee-600" />
                </Link>

                {/* ShadCN AlertDialog for Logout */}
                <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-1">
                      <LogOut className="h-4 w-4" /> Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                      Are you sure you want to log out?
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleLogout}>
                        Logout
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    <User className="h-5 w-5 text-coffee-600" />
                    <span>Trang cá nhân</span>
                  </Link>

                  {/* Mobile Logout */}
                  <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full flex items-center gap-1">
                        <LogOut className="h-4 w-4" /> Logout
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                        Are you sure you want to log out?
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                          Logout
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
