"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Percent } from 'lucide-react';

export default function PromotionalBannerSection() {
  // On commence à 0 (tout à gauche)
  const [sliderPosition, setSliderPosition] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animation au scroll (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          // Attendre un petit peu pour que l'utilisateur voit le début
          setTimeout(() => {
            setSliderPosition(50); // Déplacement vers le milieu (50%)
            setHasAnimated(true);
          }, 300);
        }
      },
      {
        threshold: 0.2, // Se déclenche à 20% de visibilité
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section ref={sectionRef} className="w-full bg-background mt-4 mb-4">
      <div className="px-4 md:px-8 xl:px-12">
        
        {/* Header Section consistency with other sections */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-10 gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Promotions Exclusives</h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium">Découvrez nos offres exceptionnelles</p>
            </div>
          </div>
        </div>

        {/* Slider Container with Rounded Corners */}
        <div className="relative w-full aspect-video lg:h-[700px] select-none rounded-3xl overflow-hidden shadow-xl border border-border/50">
          
          {/* Image de DROITE (Après) */}
          <img
            src="/images/macOrange.webp"
            alt="Après"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Image de GAUCHE (Avant) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden transition-all"
            style={{ 
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              transition: sliderPosition === 50 ? 'clip-path 1.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none' 
            }}
          >
            <img
              src="/images/macGriy.webp" 
              alt="Avant"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Contrôle invisible */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

          {/* Ligne et Curseur avec Animation */}
          <div
            className="absolute top-0 bottom-0 w-[2.5px] bg-white/80 backdrop-blur-sm z-20 pointer-events-none transition-all"
            style={{ 
              left: `${sliderPosition}%`,
              transition: sliderPosition === 50 ? 'left 1.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-gray-100/50 backdrop-blur-md">
              <div className="flex items-center justify-center gap-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Overlay labels for a more premium look */}
          <div className="absolute bottom-6 left-6 z-10 pointer-events-none bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Avant</span>
          </div>
          <div className="absolute bottom-6 right-6 z-10 pointer-events-none bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Après</span>
          </div>
        </div>
      </div>
    </section>
  );
}