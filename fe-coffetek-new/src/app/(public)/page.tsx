"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/commons/mode-toggle";



import Banner from "@/components/sections/Banner";
import Explore from "@/components/sections/Explore";
import OrderCoffee from "@/components/sections/OrderCoffee";
import SellingCoffee from "@/components/sections/SellingCoffee";
import InstantCoffee from "@/components/sections/InstantCoffee";
import Testimonial from "@/components/sections/Testimonial";


export default function Home() {
  const [dark, setDark] = useState(false);

  return (
    <div>
      <Banner />
      <Explore />
      <OrderCoffee />
      <SellingCoffee />
      <InstantCoffee />
      <Testimonial />
    </div>
  );
}
