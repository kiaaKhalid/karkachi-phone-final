"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const hotspots = [
  {
    id: "monitor",
    title: "Écran Dell UltraSharp",
    price: "4 499 Dh",
    rating: "4.8 (120)",
    top: "50%",
    left: "15%",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "phone",
    title: "Samsung Galaxy S24",
    price: "8 999 Dh",
    rating: "4.9 (450)",
    top: "48%",
    left: "52%",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "keyboard",
    title: "Logitech MX Mechanical",
    price: "1 299 Dh",
    rating: "4.7 (89)",
    top: "86%",
    left: "34%",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "laptop",
    title: "MacBook Pro M3",
    price: "15 499 Dh",
    rating: "5.0 (210)",
    top: "94%",
    left: "5%",
    image: "https://images.unsplash.com/photo-1517336712461-70179aa7b188?q=80&w=2067&auto=format&fit=crop"
  }
]

export default function ProductShowcase() {
  const [activeProduct, setActiveProduct] = useState(hotspots[1]) // Phone by default
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
    monitor: false,
    phone: false,
    keyboard: false,
    laptop: false
  })
  const sectionRef = useRef<HTMLElement>(null)
  const hasTriggeredRef = useRef(false)

  const handleOpenChange = (id: string, isOpen: boolean) => {
    setOpenStates(prev => ({ ...prev, [id]: isOpen }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          setOpenStates({
            monitor: true,
            phone: true,
            keyboard: true,
            laptop: true
          })
          setTimeout(() => {
            setOpenStates({
              monitor: false,
              phone: false,
              keyboard: false,
              laptop: false
            })
          }, 10000)
        }
      },
      { threshold: 0.15 } // Trigger when 15% of the section is visible
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full bg-white dark:bg-slate-950 py-12 md:py-20 overflow-hidden">
      {/* ULTRA-WIDE CONTAINER: Increased to 1850px width */}
      <div className="max-w-[1850px] mx-auto px-4 md:px-12 xl:px-16">
        
        {/* Header Section: Minimalist & Catchy */}
        <div className="text-center mb-10 md:mb-16 space-y-3 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
            Vivez <span className="text-accent">l'Innovation</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Survolez les points pour découvrir notre sélection premium.
          </p>
        </div>

        {/* Main Grid: Card-based matching reference with 2:1 ratio for ultra-wide look */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-stretch h-full">
          
          {/* Column 1: Interactive Image Container (Increased width to Span 9) */}
          <div className="lg:col-span-9 relative h-[450px] md:h-[600px] lg:h-[680px] rounded-[3rem] overflow-hidden shadow-sm shadow-black/5 group/container">
            <Image
              src="/images/presentation-des-produits.png"
              alt="Adoptez le look"
              fill
              className="object-cover transition-all duration-1000" // NO ZOOM as per feedback
              priority
            />
            
            <div className="absolute inset-0 bg-black/5 transition-colors duration-500" />

            {/* Hotspots: SOLID WHITE CIRCLES as per reference */}
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                className="absolute z-20 transition-transform duration-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: spot.top, left: spot.left }}
              >
                <HoverCard 
                  open={openStates[spot.id]} 
                  onOpenChange={(isOpen) => handleOpenChange(spot.id, isOpen)}
                  openDelay={0} 
                  closeDelay={100}
                >
                  <HoverCardTrigger asChild>
                    <button 
                      className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 focus-visible:outline-none group/hotspot"
                      onMouseEnter={() => setActiveProduct(spot)}
                      aria-label={`Voir les détails de ${spot.title}`}
                    >
                      {/* Ripple waves to attract user attention */}
                      <span className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/30 animate-ping pointer-events-none" />
                      <span className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 animate-pulse pointer-events-none" />
                      
                      {/* Main Solid Circle with subtle border */}
                      <span className={cn(
                        "relative flex items-baseline justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-white shadow-2xl transition-all duration-300 border-[6px] border-white/20 z-10",
                        activeProduct.id === spot.id ? "scale-110" : "scale-100 group-hover/hotspot:scale-110"
                      )} />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent 
                    side="top" 
                    align="center" 
                    className="w-48 p-3 rounded-xl border-none shadow-xl bg-white/95 backdrop-blur-md dark:bg-black/95 animate-in fade-in zoom-in duration-200"
                  >
                    <div className="text-center">
                      <p className="text-sm font-black text-foreground tracking-tight truncate">{spot.title}</p>
                      <p className="text-xs text-accent font-bold mt-1">{spot.price}</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            ))}
          </div>

          {/* Column 2: Specific Product Card (Reduced width to Span 3) */}
          <div className="lg:col-span-3 h-full flex flex-col group/gallery-container">
            <div 
              key={activeProduct.id}
              className="relative flex-1 rounded-[3rem] bg-[#F7F7F8] dark:bg-[#121215] overflow-hidden animate-in fade-in slide-in-from-right-10 duration-700 flex flex-col shadow-sm shadow-black/5"
            >
              {/* Star Rating Badge (Top Right) */}
              <div className="absolute top-6 right-6 z-20 flex items-center gap-1 bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full shadow-sm">
                <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400 border-none" />
                <span className="text-[11px] font-bold text-foreground/80 tracking-tight tracking-wider">{activeProduct.rating}</span>
              </div>

              {/* Product Image Display */}
              <div className="flex-1 relative w-full h-full p-8 lg:p-14 flex items-center justify-center">
                 <Image
                  src={activeProduct.image}
                  alt={activeProduct.title}
                  fill
                  className="object-contain p-4 md:p-10 transform transition-transform duration-1000 group-hover/gallery-container:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Product Title and Price bottom label area */}
            <div className="mt-5 flex items-center justify-between px-2">
              <h4 className="text-base font-semibold text-[#333] dark:text-white truncate max-w-[280px]">
                {activeProduct.title}
              </h4>
              <p className="text-base font-bold text-[#333] dark:text-white whitespace-nowrap">
                {activeProduct.price}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
