import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const Explore = () => {
  return (
    <div className='bg-gray-50 px-4 md:px-6 py-8 md:py-12'>
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-3'>
            Explore Our Alowishus
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto px-4">
            A drink from the "My Alowishus' bottled brews range OR grab one of our delicious coffee's
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-14 max-w-7xl mx-auto">
            {/* Card 1 */}
            <div className="shadow-lg p-6 md:p-8 hover:scale-105 transition-all hover:shadow-xl bg-white rounded-lg">
              <h1 className='text-xl md:text-2xl text-gray-700 font-semibold'>
                Our Catering
              </h1>
              <p className='text-gray-500 py-2 text-base md:text-lg'>
                Alowishus Catering, delicious drop off Catering
              </p>
              <div className="flex justify-center py-4">
                <Image 
                  src="/image/icon1.png" 
                  alt="icon1" 
                  width={200} 
                  height={200}
                  className="w-[150px] md:w-[200px] h-auto" 
                />
              </div>
              <Button className='w-full bg-blackdark-900 text-white p-4 md:p-6 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 tracking-wide text-sm md:text-base'>
                ORDER CATERING
              </Button>
            </div>

            {/* Card 2 */}
            <div className="shadow-lg p-6 md:p-8 hover:scale-105 transition-all hover:shadow-xl bg-white rounded-lg">
              <h1 className='text-xl md:text-2xl text-gray-700 font-semibold'>
                The Food
              </h1>
              <p className='text-gray-500 py-2 text-base md:text-lg'>
                Our menu is available as dine in or takeaway
              </p>
              <div className="flex justify-center py-4">
                <Image 
                  src="/image/icon2.png" 
                  alt="icon2" 
                  width={200} 
                  height={200}
                  className="w-[150px] md:w-[200px] h-auto" 
                />
              </div>
              <Button className='w-full bg-blackdark-900 text-white p-4 md:p-6 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 tracking-wide text-sm md:text-base'>
                FOOD MENU
              </Button>
            </div>

            {/* Card 3 */}
            <div className="shadow-lg p-6 md:p-8 hover:scale-105 transition-all hover:shadow-xl bg-white rounded-lg">
              <h1 className='text-xl md:text-2xl text-gray-700 font-semibold'>
                The Gelato
              </h1>
              <p className='text-gray-500 py-2 text-base md:text-lg'>
                Life is like Gelato, enjoy it before it melts away
              </p>
              <div className="flex justify-center py-4">
                <Image 
                  src="/image/icon1.png" 
                  alt="icon3" 
                  width={200} 
                  height={200}
                  className="w-[150px] md:w-[200px] h-auto" 
                />
              </div>
              <Button className='w-full bg-blackdark-900 text-white p-4 md:p-6 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 tracking-wide text-sm md:text-base'>
                DISCOVER MORE
              </Button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Explore

