'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { RoleNavigationButtons } from '../commons/RoleNavigationButtons'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthContext } from '@/contexts/AuthContext'
import { authService } from '@/services'
import { HomeNotificationBellAndBadge } from '../commons/notification'
// --- IMPORT MỚI ---

const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const { isAuthenticated, setIsAuthenticated, setUser, user, loading } = useAuthContext();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = () => {
    setIsLogoutDialogOpen(false)
    setIsMenuOpen(false)
    authService.logout(setUser, setIsAuthenticated);
    toast.success("Logout success!")
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return "U";
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
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Home', 'Menu', 'Promotions', 'About', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="hover:text-coffee-600 font-medium text-sm uppercase tracking-wide"
              >
                {item === 'Promotions' ? 'Promotion' : item === 'About' ? 'About Us' : item}
              </Link>
            ))}
            <Link
              href="/kiosk"
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium text-sm uppercase tracking-wide transition-colors shadow-md"
            >
              Kiosk
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {loading ? (
              <>
                {/* Loading placeholder if needed */}
              </>
            ) : !isAuthenticated && !loading ? (
              <>
                <Button variant="outline" className="px-6" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button className="px-6" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <>
                {/* --- NOTIFICATION BELL (Added Here) --- */}
                <HomeNotificationBellAndBadge />

                {/* ✅ Professional User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-10 w-10 rounded-full border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 ml-2">
                    <Avatar className="h-full w-full">
                      <AvatarFallback className="select-none bg-primary/10 text-primary font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-64 p-2 z-[100]" align="end">
                    {/* User Info Header */}
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="w-full cursor-pointer flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>

                      <RoleNavigationButtons layout="dropdown" />
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                      onClick={() => setIsLogoutDialogOpen(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className='flex md:hidden items-center gap-2'>
            {/* Hiển thị chuông trên Mobile luôn nếu muốn */}
            {isAuthenticated && <HomeNotificationBellAndBadge />}

            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
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
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarFallback className="bg-primary/10">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</span>
                    </div>
                  </div>

                  <RoleNavigationButtons layout="default" />

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 text-coffee-600" />
                    <span>Profile</span>
                  </Link>

                  <Button
                    variant="destructive"
                    className="w-full flex items-center gap-1 !text-white mt-2"
                    onClick={() => setIsLogoutDialogOpen(true)}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Global Logout Confirmation Dialog */}
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
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
      </div>
    </header>
  )
}

export default PublicHeader