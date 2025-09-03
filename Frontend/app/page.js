import Image from "next/image";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Explore from "./components/Explore";
import OrderCoffee from "./components/OrderCoffee";
import SellingCoffee from "./components/SellingCoffee";
import InstantCoffee from "./components/InstantCoffee";
import Footer from "./components/Footer";
// import Testimonial from "./components/Testimonial";

export default function Home() {
  return (
    <>
      <Header />
      <Banner />
      <Explore />
      <OrderCoffee />
      <SellingCoffee />
      <InstantCoffee />
      {/* <Testimonial /> */}
      <Footer />
    </>
  );
}
