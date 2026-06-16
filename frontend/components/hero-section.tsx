"use client"

import { useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // 5 seconds per slide
    
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden mt-[-26px] h-[700px] sm:h-[600px] md:h-[790px] lg:h-[800px] xxl:h-[1100px] flex flex-col justify-center bg-slate-50 dark:bg-slate-900 group">
      
      <div className="overflow-hidden w-full h-full absolute inset-0" ref={emblaRef}>
        <div className="flex w-full h-full">
          
          {/* SLIDE 1: Ancien design */}
          <div className="relative flex-[0_0_100%] min-w-0 h-full flex flex-col justify-center">
            {/* GESTION DES IMAGES D'ARRIÈRE-PLAN */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-white/10 dark:bg-black/50 z-10" />
              {/* MODE CLAIR */}
              <Image src="/images/panelMobile.webp" alt="Bannière Mobile" fill priority className="object-cover object-center sm:hidden dark:hidden" />
              <Image src="/images/panelIpad.webp" alt="Bannière Tablette" fill priority className="object-cover object-center hidden sm:block lg:hidden dark:hidden" />
              <Image src="/images/panel.webp" alt="Bannière Bureau" fill priority className="object-cover object-top hidden lg:block dark:hidden" />
              {/* MODE SOMBRE */}
              <Image src="/images/panelMobileDark.webp" alt="Bannière Mobile Sombre" fill priority className="object-cover object-center hidden dark:block sm:dark:hidden" />
              <Image src="/images/panelIpadDark.webp" alt="Bannière Tablette Sombre" fill priority className="object-cover object-center hidden sm:dark:block lg:dark:hidden" />
              <Image src="/images/panelDark.webp" alt="Bannière Bureau Sombre" fill priority className="object-cover object-top hidden lg:dark:block" />
            </div>

            {/* CONTENU SLIDE 1 */}
            <div className="section-container relative z-20 py-20 flex flex-col items-center text-center max-w-4xl mx-auto h-full justify-center">
              <div className="space-y-8 animate-fade-in-up">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 leading-[1.05] tracking-tight drop-shadow-lg">
                  Trouvez Votre <br />
                  <span className="text-accent">Compagnon</span> Tech Idéal
                </h1>
                <p className="text-slate-700 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
                  Smartphones, tablettes et accessoires premium aux meilleurs prix.
                  Livraison rapide partout au Maroc.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link href="/products" className="btn-cta inline-flex items-center gap-2 px-8 py-4 text-lg w-full sm:w-auto">
                    Explorer la boutique
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/deals" className="btn-cta-outline bg-black/5 backdrop-blur-sm border-black/10 text-slate-900 dark:bg-white/10 dark:border-white/20 dark:text-white inline-flex items-center gap-2 px-8 py-4 text-lg w-full sm:w-auto hover:bg-black/10 dark:hover:bg-white/20 transition-all">
                    Voir les deals
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: NOUVEAU DESIGN APPLE */}
          <div className="relative flex-[0_0_100%] min-w-0 h-full flex flex-col justify-center overflow-hidden">
            
            {/* Background avec dégradé sophistiqué pour Apple - Adaptable Light/Dark */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-0 transition-colors duration-500" />
            
            {/* Éléments décoratifs en arrière-plan */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0 pointer-events-none" />

            <div className="relative z-20 flex flex-col items-start justify-center h-full w-full px-6 sm:px-12 lg:px-20 xl:px-32">
              
              {/* Contenu textuel */}
              <div className="w-full sm:w-[60%] lg:w-[45%] xl:w-[40%] space-y-4 sm:space-y-6 lg:space-y-8 text-center sm:text-left animate-fade-in-up mt-[-25%] sm:mt-0 relative z-20 mr-auto">
                <div className="inline-flex items-center self-center sm:self-start gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white backdrop-blur-sm border border-black/5 dark:border-white/10 text-xs sm:text-sm font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  {" Nouveauté Apple"}
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  L'écosystème <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Sans Limites.
                  </span>
                </h2>
                
                <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto sm:mx-0 font-medium leading-relaxed">
                  Découvrez les dernières innovations Apple. Des performances ultimes pour stimuler votre créativité au quotidien.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 pt-4">
                  <Link href="/products?search=Apple" className="btn-cta bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto shadow-xl shadow-slate-900/20 dark:shadow-white/10 border-0">
                    Acheter maintenant
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

            </div>

            {/* Image Apple (Fixe) - Positionnée du top au bottom à droite */}
            <div className="absolute bottom-0 sm:top-0 right-0 w-full sm:w-[80%] lg:w-[65%] h-[50%] sm:h-full z-10 pointer-events-none">
              <Image 
                src="/images/bannier-apple.webp" 
                alt="Collection Apple" 
                fill 
                priority
                className="object-contain object-bottom sm:object-cover sm:object-right drop-shadow-2xl"
                sizes="(max-w-640px) 100vw, (max-w-1024px) 80vw, 65vw"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white transition-all opacity-0 group-hover:opacity-100 z-40 border border-white/30 dark:border-white/10"
        aria-label="Slide précédente"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white transition-all opacity-0 group-hover:opacity-100 z-40 border border-white/30 dark:border-white/10"
        aria-label="Slide suivante"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* --- SHAPE DIVIDER (JAGGED ROUGH EDGE) --- */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-30 pointer-events-none translate-y-[1px]">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="relative block w-full h-[10px] md:h-[20px] lg:h-[30px] transform rotate-180">
          <path d="M0 0v47.6l5-2c1 0 11 3 12 0 2 3 6-3 6 0 0-4 12 3 12 0 0 3 15-1 17 0 2-2 5-1 6 0 0-2 6 2 6 0s2 4 4 0c5 2 12-3 16 0 2-2 4 3 4 0 0 2 6-1 6 0 1 4 15-2 17 0h7c0 1 3-3 6 0h17c2 2 3 1 6 0h6c1-2 21-1 24 0 2 1 4 2 6 0 0-1 22 4 24 0 0 0 5-3 5 0 2-2 10 2 12 0 2 2 6 1 6 0 2 3 4-2 6 0 1 0 25-2 25 1l10-1c3 1 6 6 7 0 1 5 4-2 6 0 2-2 4 3 5 0h12c6 1 36 2 36 0 0 2 3 0 6 0h6c5-2 7 4 11 0 2 0 15 2 17 0h13c3-4 5 1 7 0h29c0-3 6 0 6 0h5c0 2 16-1 18 0 1 4 9-1 12 0s6-2 6 0c8-2 3 4 13 0h10c3 4 19 1 19 0 2 0 21 1 23-1 1 4 3-1 6 1 1 2 11-1 12-1 3 3 9 0 12 1 3-4 6 1 6 0h6c0-3 5 1 6-1 0 3 2 1 4 1 3 4 10-1 13 0 3-2 6-1 6 0 2 2 2 0 6 0 1-2 6 2 6 0 2 0 4 5 6 0h18c2 3 4 1 6 0l6-1c3 2 12 3 17 1 14 3 18 1 24 0 2-1 3 3 5 0 6 2 10-1 16 0 1 3 6 0 9 0 0-2 3 2 5 0 6-6 8 7 13 0 0-2 5 2 5 0 3 3 10 0 10 0 1 2 5-2 8 0 3-1 8 3 12 0h6c2 1 10 4 12 0h6c1-1 5 2 6 0 1 2 4-1 6 0 0-2 5 3 6-1 2 1 6 5 5 1 1 1 3-2 6 0 2-1 5 3 6 0 0 1 6 2 6 0 2 3 4-4 6 0 0-2 3 2 6 0 3 0 6 3 6 0 5 3 8-1 13 0 3-4 6 1 6 0h5c0-1 9 2 12 0 1-1 9 3 11 0h6c2 2 4 4 7 0 3 2 5-4 5-1 10 4 15-2 18 2 0-1 6 2 6-2 0 0 6-2 6 1 1 6 12 2 12 0 1 3 4-3 7 2 2-2 5 2 5 0 1 5 4-5 6 0 2-1 4 2 6 0 1 3 1 0 5 0V0H0Z" className="svg-divider-fill" />
        </svg>
      </div>
    </section>
  )
}