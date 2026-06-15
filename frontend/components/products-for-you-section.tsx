"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import ProductCard from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"


const API = process.env.NEXT_PUBLIC_API_URL

export default function ProductsForYouSection() {
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

    fetch(`${API}/public/products/recommended`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setProducts(data.data)
        } else {
          setProducts([])
        }
      })
      .catch((err) => {
        console.error("Error fetching recommended products:", err)
        setProducts([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (!isLoading && products.length === 0) return null

  return (
    <section className="bg-[#eff1f5] dark:bg-[#0d0f14] w-full relative overflow-hidden">
      {/* Full width container as requested: "No space empty in left and right" */}
      <div className="w-full px-4 md:px-8 xl:px-12 py-10 md:py-16 border-t border-border/50">
        
        {/* Header: Centered on mobile, stretched on desktop */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Recommandé Pour Vous</h2>
              <p className="text-sm md:text-lg text-muted-foreground">Sélectionné selon vos goûts</p>
            </div>
          </div>
          <Link
            href="/products?sort=popular"
            className="group flex items-center gap-2 text-sm font-bold text-accent px-6 py-3 rounded-full bg-accent/5 hover:bg-accent/10 transition-all"
          >
            Découvrir tout
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* Products Grid: Dynamic responsive columns */}
        {/* Phone: 1 col, Tablet: 3 cols, PC: 4 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {isLoading
            ? ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7", "sk-8"].map((id) => <ProductCardSkeleton key={id} />)
            : products.map((p: any, index: number) => {
                const stringId = p.id?.toString() || p.id || "";
                const normalizedProduct = { ...p, id: stringId };
                
                // Visibility Logic Based on User Requirements:
                // - Phone: 6 products total (Items 1-6)
                // - Tablet: 9 products total (Items 1-9)
                // - PC: 8 products total (Items 1-8)
                const visibilityClass = cn(
                  index >= 6 ? "hidden md:block" : "block", // Hide items 7, 8, 9 on phone
                  index === 8 ? "lg:hidden" : "" // Hide item 9 on PC (where 8 is the goal)
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

      {/* --- SHAPE DIVIDER (LAYERED WAVES) --- */}
      
    </section>
  )
}