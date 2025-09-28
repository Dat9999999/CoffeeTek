import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PromotionCard from "@/components/promotions/PromotionCard";
import { promotions } from "@/lib/promotionsData";

export default function PromotionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Promotions</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => (
            <PromotionCard key={promo.id} {...promo} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
