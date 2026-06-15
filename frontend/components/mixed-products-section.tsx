"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, ArrowRight } from "lucide-react"
import ProductCard from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"

const API = process.env.NEXT_PUBLIC_API_URL

export default function MixedProductsSection() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    setIsLoading(true)
    if (!API) {
      setIsLoading(false)
      return
    }
    
    fetch(`${API}/public/products/best-sellers`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setProducts(data.data)
        } else {
          setProducts([])
        }
      })
      .catch((err) => {
        console.error("Error fetching best sellers:", err)
        setProducts([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (!isLoading && products.length === 0) return null

  return (
    <section className="bg-[#F8F8FA] dark:bg-background w-full overflow-hidden">
      {/* Full width container matching ProductsForYouSection padding */}
      <div className="w-full px-4 md:px-8 xl:px-12 py-10 md:py-16 border-t border-border/50">
        
        {/* Header Section: Professional & Aligned */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Meilleures Ventes</h2>
              <p className="text-sm md:text-lg text-muted-foreground font-medium">Les produits les plus populaires en ce moment</p>
            </div>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-2 text-sm font-bold text-foreground hover:text-accent transition-all px-6 py-3 rounded-full bg-white dark:bg-black/40 shadow-sm border border-border/50"
          >
            Explorer tout
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Dynamic Grid: 1 col (Phone), 3 cols (Tablet), 4 cols (PC) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {isLoading
            ? ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"].map((id) => <ProductCardSkeleton key={id} />)
            : products.map((p: any, index: number) => {
                const stringId = p.id?.toString() || p.id || "";
                const normalizedProduct = { ...p, id: stringId };
                
                // Visibility Class Logic (Same as ProductsForYouSection for consistency):
                // - Phone: Show 6 products (Indices 0-5)
                // - Tablet: Show 9 products (Indices 0-8)
                // - PC: Show 8 products (Indices 0-7)
                const visibilityClass = cn(
                  index >= 6 ? "hidden md:block" : "block", // Hide items 7, 8, 9 on mobile
                  index === 8 ? "lg:hidden" : "" // Hide item 9 on PC
                );

                return (
                  <div key={stringId} className={visibilityClass}>
                    <ProductCard
                      product={normalizedProduct}
                      isInWishlist={isInWishlist(stringId)}
                      onToggleWishlist={() => 
                        isInWishlist(stringId) 
                          ? removeFromWishlist(stringId) 
                          : addToWishlist(normalizedProduct)
                      }
                      onAddToCart={() =>
                        addItem({ id: stringId, name: p.name, price: Number(p.price), image: p.image || "" })
                      }
                    />
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  )
}