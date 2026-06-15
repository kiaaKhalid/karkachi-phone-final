import HeroSection from "@/components/hero-section"
import PromotionalBannerSection from "@/components/promotional-banner-section"
import MixedProductsSection from "@/components/mixed-products-section"
import DealsSection from "@/components/deals-section"
import ProductsForYouSection from "@/components/products-for-you-section"
import AudioImmersionSection from "@/components/audio-immersion-section"
import BrandsMarquee from "@/components/brands-marquee"
import ProductShowcase from "@/components/product-showcase"
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <BrandsMarquee />
      <MixedProductsSection />
      <PromotionalBannerSection />
      <ProductsForYouSection />
      <AudioImmersionSection />
      <DealsSection />
      <ProductShowcase />
    </main>
  )
}
