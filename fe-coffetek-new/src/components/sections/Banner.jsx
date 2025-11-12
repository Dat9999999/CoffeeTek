'use client'
import React from 'react'
import {Autoplay} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Button } from "@/components/ui/button"
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const Banner = () => {
  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop={true}
    >
      <SwiperSlide className='bg-gray-100 cursor-pointer'>
        <div className="container mx-auto p-4 lg:p-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className='relative'>
                    <h1 className='text-4xl sm:text-5xl lg:text-7xl font-bold py-4 lg:py-8'>
                        Alowishus Delicious Coffee
                        <span className='absolute top-[4] ml-2 hidden lg:inline-block'>
                            <Image 
                              src="/image/cafe.png" 
                              alt="coffee" 
                              width={80} 
                              height={80}
                              className="w-[80px] h-[80px]" 
                            />
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg max-w-[90%] sm:max-w-[80%] lg:max-w-full">
                        A drink from the 'My Alowishus' bottled brews range OR grab one of our delicious coffee's
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 py-6">
                        <Button className='p-7 rounded-md shadow-lg hover:scale-105 transition-all duration-300 text-lg font-normal tracking-wide' variant="default">
                          Download App
                        </Button>
                        <Button className='p-7 rounded-md shadow-lg hover:scale-105 transition-all duration-300 text-lg font-normal tracking-wide' variant="outline">
                          Shop Coffee
                        </Button>
                    </div>
                </div>
                <div className='relative hidden lg:block'>
                    <Image 
                      src="/image/hero1.png" 
                      alt="banner" 
                      width={400} 
                      height={400} 
                      className='ml-40' 
                    />
                    <div className="absolute top-0 right-24">
                        <Image 
                          src="/image/cafe.png" 
                          alt="coffee" 
                          width={120} 
                          height={120} 
                        />
                    </div>
                </div>
            </div>
        </div>
      </SwiperSlide>

      {/* Second Slide */}
      <SwiperSlide className='bg-gray-100 cursor-pointer'>
        <div className="container mx-auto p-4 lg:p-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className='relative'>
                    <h1 className='text-4xl sm:text-5xl lg:text-7xl font-bold py-4 lg:py-8'>
                        Alowishus Delicious Coffee
                        <span className='absolute top-[4] ml-2 hidden lg:inline-block'>
                            <Image src="/image/cafe.png" alt="coffee" width={80} height={80} />
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg max-w-[90%] sm:max-w-[80%] lg:max-w-full">
                        A drink from the 'My Alowishus' bottled brews range OR grab one of our delicious coffee's
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 py-6">
                        <Button className='p-7 rounded-md shadow-lg hover:scale-105 transition-all duration-300 text-lg font-normal tracking-wide' variant="default">
                          Download App
                        </Button>
                        <Button className='p-7 rounded-md shadow-lg hover:scale-105 transition-all duration-300 text-lg font-normal tracking-wide' variant="outline">
                          Shop Coffee
                        </Button>
                    </div>
                </div>
                <div className='relative hidden lg:block'>
                    <Image 
                      src="/image/coffee-mid.png" 
                      alt="banner" 
                      width={400} 
                      height={400} 
                      className='ml-40' 
                    />
                    <div className="absolute top-0 right-24">
                        <Image 
                          src="/image/cafe.png" 
                          alt="coffee" 
                          width={120} 
                          height={120} 
                        />
                    </div>
                </div>
            </div>
        </div>
      </SwiperSlide>

      {/* Third Slide */}
      {/* Apply same pattern to third slide */}
      
    </Swiper>
  )
}

export default Banner