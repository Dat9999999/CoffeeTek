import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const InstantCoffee = () => {
  return (
    <div className="bg-gray-50 py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Instant Coffee At Your Home
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            A drink from the 'My Alowishus' bottled brews range OR grab one of our delicious coffee's
          </p>
        </div>

        {/* Coffee Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="relative aspect-square mb-4">
              <Image
                src="/image/image1.png"
                alt="Double Espresso"
                fill
                className="object-fill rounded-md shadow-lg shadow-gray-300"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Double Espresso</h3>
              <p className="text-gray-600 mb-4">$59.99</p>
              <Button className="w-full py-6 rounded-full bg-gray-900 hover:bg-gray-700 transition-colors">
                ADD TO CART
              </Button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="relative aspect-square mb-4">
              <Image
                src="/image/image2.png"
                alt="Caramel Frappe"
                fill
                className="object-fill rounded-md shadow-lg shadow-gray-300"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Caramel Frappe</h3>
              <p className="text-gray-600 mb-4">$49.99</p>
              <Button className="w-full py-6 rounded-full  bg-gray-900 hover:bg-gray-700  transition-colors">
                ADD TO CART
              </Button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="relative aspect-square mb-4">
              <Image
                src="/image/image3.png"
                alt="Iced Coffee"
                fill
                className="object-fill rounded-md shadow-lg shadow-gray-300"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Iced Coffee</h3>
              <p className="text-gray-600 mb-4">$39.99</p>
              <Button className="w-full py-6 rounded-full  bg-gray-900 hover:bg-gray-700  transition-colors">
                ADD TO CART
              </Button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="relative aspect-square mb-4">
              <Image
                src="/image/image4.png"
                alt="Regular Coffee"
                fill
                className="object-fill rounded-md shadow-lg shadow-gray-300"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Regular Coffee</h3>
              <p className="text-gray-600 mb-4">$29.99</p>
              <Button className="w-full py-6 rounded-full  bg-gray-900 hover:bg-gray-700  transition-colors">
                ADD TO CART
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstantCoffee