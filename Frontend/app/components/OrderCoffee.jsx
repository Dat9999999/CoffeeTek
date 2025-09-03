import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const OrderCoffee = () => {
  return (
    <div className="bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Order Your Favourite Coffee
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mb-6 max-w-xl mx-auto lg:mx-0">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. 
              Velit officia consequat duis enim velit mollit. 
              Exercitation veniam consequat sunt nostrud amet.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-6 mb-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-coffee-600 mb-2">20+</h3>
                <p className="text-gray-600">Years Experience</p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-coffee-600 mb-2">100+</h3>
                <p className="text-gray-600">Master Chefs</p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-coffee-600 mb-2">30+</h3>
                <p className="text-gray-600">Achievements</p>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-coffee-600 mb-2">100+</h3>
                <p className="text-gray-600">Food Items</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="px-8 py-6 rounded-full bg-gray-900 hover:bg-gray-700 transition-colors text-white">
                Order Now
              </Button>
              <Button variant="outline" className="px-8 py-6 rounded-full hover:bg-gray-100 transition-colors">
                Watch Video
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-square max-w-[500px] mx-auto">
              <Image
                src="/image/hero.png"
                alt="Coffee Cup"
                fill
                className="object-contain rounded-md shadow-lg shadow-gray-300 -rotate-12"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="hidden lg:block absolute top-10 left-0 animate-bounce">
              <Image
                src="/image/mid1.png"
                alt="Coffee Beans"
                width={80}
                height={80}
              />
            </div>
            <div className="hidden lg:block absolute bottom-10 right-0 animate-bounce delay-150">
              <Image
                src="/image/coffee-banner.png"
                alt="Coffee Beans"
                width={250}
                height={250}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderCoffee