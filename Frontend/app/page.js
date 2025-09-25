import Image from "next/image";
import Header from "@/components/layout/Header";
import Banner from "@/components/sections/Banner";
import Explore from "@/components/sections/Explore";
import OrderCoffee from "@/components/sections/OrderCoffee";
import SellingCoffee from "@/components/sections/SellingCoffee";
import InstantCoffee from "@/components/sections/InstantCoffee";
import Footer from "@/components/layout/Footer";
import Testimonial from "@/components/sections/Testimonial";

export default function Home() {
  return (
    <>
      <Header />
      <Banner />
      <Explore />
      <OrderCoffee />
      <SellingCoffee />
      <InstantCoffee />
      <Testimonial />
      <Footer />
    </>
  );
}
