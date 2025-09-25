import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const SellingCoffee = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Best Selling Coffee</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus optio
            quisquam dicta maxime, perferendis veniam!
          </p>
        </div>

        {/* Coffee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">#1 Selling</p>
            <h3 className="text-xl font-semibold mb-2">Double Espresso</h3>
            <div className="mb-4">
              <Image
                src="/image/mid1.png"
                alt="Double Espresso"
                width={200}
                height={250}
                className="mx-auto"
              />
            </div>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit
              dicta alias id, nostrum rerum cum ducimus omnis neque cumque nam.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-xl font-bold">$ 59.99</span>
              <Button className="bg-black text-white px-4 py-2 rounded">
                Order Now
              </Button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">#2 Selling</p>
            <h3 className="text-xl font-semibold mb-2"> Espresso</h3>
            <div className="mb-4">
              <Image
                src="/image/mid2.png"
                alt="Double Espresso"
                width={200}
                height={250}
                className="mx-auto"
              />
            </div>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit
              dicta alias id, nostrum rerum cum ducimus omnis neque cumque nam.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-xl font-bold">$ 59.99</span>
              <Button className="bg-black text-white px-4 py-2 rounded">
                Order Now
              </Button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">#3 Selling</p>
            <h3 className="text-xl font-semibold mb-2">Short Macchiato</h3>
            <div className="mb-4">
              <Image
                src="/image/mid3.png"
                alt="Double Espresso"
                width={200}
                height={250}
                className="mx-auto"
              />
            </div>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit
              dicta alias id, nostrum rerum cum ducimus omnis neque cumque nam.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-xl font-bold">$ 59.99</span>
              <Button className="bg-black text-white px-4 py-2 rounded">
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellingCoffee;
