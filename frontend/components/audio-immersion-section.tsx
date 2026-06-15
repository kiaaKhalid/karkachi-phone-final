"use client"

import Image from "next/image"
import { AudioLines, BatteryCharging, Mic, Bluetooth } from "lucide-react"

export default function AudioImmersionSection() {
  return (
    <section className="relative w-full bg-white dark:bg-black pt-16 md:pt-24 pb-0 overflow-hidden border-t border-border/50">
      {/* Background Subtle Gradient / Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 xl:px-12 relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-16 md:mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pure <span className="text-slate-400 dark:text-slate-500">Immersion</span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Immerse in rich, balanced audio with zero distractions and seamless design.
          </p>
        </div>

        {/* Features Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end pb-0">
          
          {/* Left Features */}
          <div className="lg:col-span-3 flex flex-col gap-16 lg:gap-24 order-2 lg:order-1 px-4 lg:px-0 mb-16 lg:mb-32">
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-5 group">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-white/10 dark:to-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 group-hover:border-orange-500/50 group-hover:text-orange-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300">
                <AudioLines className="w-6 h-6" />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[250px]">
                Focus on what matters with adaptive ANC.
              </p>
            </div>

            <div className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-5 group">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-white/10 dark:to-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 group-hover:border-orange-500/50 group-hover:text-orange-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[250px]">
                Enjoy music, calls, and podcasts all day.
              </p>
            </div>
          </div>

          {/* Center Image */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center items-end relative h-full mt-10 lg:mt-0">
            <div className="relative w-full max-w-[500px] lg:max-w-[700px] xl:max-w-[900px] aspect-square flex items-end justify-center scale-[1.4] lg:scale-[1.6] xl:scale-[1.8] origin-bottom pointer-events-none">
              
              {/* Perfect Circle Glow - Light Mode Only */}
              <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full bg-orange-400/20 opacity-100 dark:opacity-0 pointer-events-none blur-[60px] md:blur-[100px] transition-opacity duration-500" />

              {/* Professional Glowing Effect - Dark Mode */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/30 via-orange-500/10 to-transparent opacity-0 dark:opacity-100 pointer-events-none blur-3xl transition-opacity duration-500 mix-blend-screen" />
              
              {/* Extra Subtle Star/Node Glows - Dark Mode Only */}
              <div className="absolute top-[30%] left-[20%] w-32 h-32 bg-orange-400/20 blur-2xl rounded-full opacity-0 dark:opacity-100 mix-blend-screen" />
              <div className="absolute bottom-[20%] right-[20%] w-40 h-40 bg-amber-500/20 blur-3xl rounded-full opacity-0 dark:opacity-100 mix-blend-screen" />

              {/* The Image (Assumes a transparent background PNG) */}
              <Image 
                src="/images/headphone-immersion.png" 
                alt="Audio Immersion" 
                fill 
                className="object-contain object-bottom z-10 drop-shadow-[0_20px_50px_rgba(249,115,22,0.1)] dark:drop-shadow-[0_20px_50px_rgba(255,165,0,0.15)] transition-all duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Right Features */}
          <div className="lg:col-span-3 flex flex-col gap-16 lg:gap-24 order-3 px-4 lg:px-0 mb-16 lg:mb-32">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 group">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-white/10 dark:to-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 group-hover:border-orange-500/50 group-hover:text-orange-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300">
                <Mic className="w-6 h-6" />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[250px]">
                Beamforming mics and noise suppression ensure your voice is clear, even in noise.
              </p>
            </div>

            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 group">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-white/10 dark:to-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 group-hover:border-orange-500/50 group-hover:text-orange-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300">
                <Bluetooth className="w-6 h-6" />
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[250px]">
                Instant pairing and stable Bluetooth 5.3 for lag-free audio.
              </p>
            </div>
          </div>

        </div>
      </div>
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 pointer-events-none -translate-y-[1px]">
        <svg 
          viewBox="0 0 1000 100" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[20px] md:h-[50px] lg:h-[60px] text-[#eff1f5] dark:text-[#0d0f14] fill-current transform rotate-0"
        >
          <g fill="currentColor">
            <path d="M0 1v99c134.3 0 153.7-99 296-99H0Z" opacity=".5"></path>
            <path d="M1000 4v86C833.3 90 833.3 3.6 666.7 3.6S500 90 333.3 90 166.7 4 0 4h1000Z" opacity=".5"></path>
            <path d="M617 1v86C372 119 384 1 196 1h421Z" opacity=".5"></path>
            <path d="M1000 0H0v52C62.5 28 125 4 250 4c250 0 250 96 500 96 125 0 187.5-24 250-48V0Z"></path>
          </g>
        </svg>
      </div>
    </section>
  )
}
