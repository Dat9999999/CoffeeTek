'use client'
import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';

const Testimonial = () => {
  return (
    <div className='container'>
        <Swiper className="mySwiper">

        <SwiperSlide><div className="w-[300px] rounded-md border bg-white dark:bg-gray-800 shadow-lg transition-colors duration-500">
    <img
      src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGJsb2d8ZW58MHx8MHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=60"
      alt="Laptop"
      className="h-[200px] w-full rounded-t-md object-cover"
    />
    <div className="p-4">
        <h1 className="inline-flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            About Macbook &nbsp;
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi,
            debitis?
        </p>
    </div>
</div>
</SwiperSlide>



        <SwiperSlide>Slide 2</SwiperSlide>
        <SwiperSlide>Slide 3</SwiperSlide>
      </Swiper>
    </div>
  )
}

export default Testimonial