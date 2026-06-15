"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const API = process.env.NEXT_PUBLIC_API_URL

export default function BrandsMarquee() {
  const [brands, setBrands] = useState<any[]>([])

  useEffect(() => {
    fetch(`${API}/public/brands/logo`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.length > 0) {
          setBrands(d.data)
        }
      })
      .catch((err) => {
        console.error("Error fetching brands:", err)
      })
  }, [])

  if (brands.length === 0) return null

  // Duplicates for seamless looping (8x for small lists)
  const items = [...brands, ...brands, ...brands, ...brands, ...brands, ...brands, ...brands, ...brands]

  return (
    <section className="bg-background py-1 relative">

      <div className="relative flex flex-col gap-10">
        {/* Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-20" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent z-20" />

        {/* Single Row: Right to Left (The "second" chain style) */}
        <div className="overflow-hidden flex">
          <div className="flex items-center animate-marquee-reverse gap-10 w-max py-4 px-5">
            {items.map((brand, i) => (
              <BrandItem key={`${brand.id}-${i}`} brand={brand} i={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Static SVG Divider positioned at the bottom, translated down to overlap the next section */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 pointer-events-none translate-y-[99%]">
        <svg 
          viewBox="0 0 1000 100" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[20px] md:h-[40px] lg:h-[60px] transform rotate-180"
        >
          <path 
            d="M0 100 L 0 90.2 C49.7 99.9 105 82 160 65c75.5-23.3 145.5-22.4 222-3 63 16 119 14 173-8 79.5-32.4 156.2-27.6 240-10 82.6 17.4 143-1 205-31.7V100H0Z" 
            className="svg-divider-fill"
          />
        </svg>
      </div>
    </section>
  )
}

function BrandItem({ brand, i }: Readonly<{ brand: any; i: number }>) {
  return (
    <div
      className={`
        flex items-center gap-4 px-8 py-4 rounded-full 
        bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl
        hover:bg-slate-50 dark:hover:bg-white/10 hover:border-accent/30 dark:hover:border-white/20 hover:scale-105
        transition-all duration-500 group/brand cursor-pointer
        animate-float-subtle
      `}
      style={{ animationDelay: `${i * 0.15}s` }}
    >
      <div className="relative w-10 h-10 shrink-0 grayscale group-hover/brand:grayscale-0 transition-all duration-700 opacity-60 group-hover/brand:opacity-100 scale-90 group-hover/brand:scale-110">
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            fill
            className="object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-200 dark:text-white/20 group-hover/brand:text-accent">
            {brand.name?.[0]}
          </div>
        )}
      </div>
      <span className="text-base font-bold tracking-tight text-slate-500 dark:text-white/40 group-hover/brand:text-slate-900 dark:group-hover/brand:text-white transition-colors whitespace-nowrap">
        {brand.name}
      </span>
    </div>
  )
}
