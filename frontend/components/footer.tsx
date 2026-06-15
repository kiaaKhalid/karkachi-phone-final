"use client"

import Link from "next/link"
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react"

const footerLinks = {
  shop: [
    { label: "Smartphones", href: "/products?category=1" },
    { label: "Accessoires", href: "/products?category=2" },
    { label: "Tablettes", href: "/products?category=3" },
    { label: "Laptops", href: "/products?category=4" },
    { label: "Deals", href: "/deals" },
  ],
  support: [
    { label: "FAQ", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Livraison", href: "/services" },
    { label: "Retours", href: "/services" },
    { label: "Garantie", href: "/services" },
    { label: "Contact", href: "/about" },
  ],
  company: [
    { label: "À Propos", href: "/about" },
    { label: "Nous Contacter", href: "/about" },
    { label: "Conditions d'utilisation", href: "/about" },
    { label: "Politique de confidentialité", href: "/about" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy-500 text-white relative">
      {/* --- SAWTOOTH SHAPE DIVIDER --- */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 pointer-events-none -translate-y-[99%]">
        <svg 
          viewBox="0 0 1000 100" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[10px] md:h-[15px] lg:h-[20px] text-navy-500 fill-current transform rotate-180"
        >
          <path d="M0 0h1000v4H0zM10 100 0 4h20l-10 96zM30 100 20 4h20l-10 96zM50 100 40 4h20l-10 96zM70 100 60 4h20l-10 96zM90 100 80 4h20l-10 96zM110 100 100 4h20l-10 96zM130 100 120 4h20l-10 96zM150 100 140 4h20l-10 96zM170 100 160 4h20l-10 96zM190 100 180 4h20l-10 96zM210 100 200 4h20l-10 96zM230 100 220 4h20l-10 96zM250 100 240 4h20l-10 96zM270 100 260 4h20l-10 96zM290 100 280 4h20l-10 96zM310 100 300 4h20l-10 96zM330 100 320 4h20l-10 96zM350 100 340 4h20l-10 96zM370 100 360 4h20l-10 96zM390 100 380 4h20l-10 96zM410 100 400 4h20l-10 96zM430 100 420 4h20l-10 96zM450 100 440 4h20l-10 96zM470 100 460 4h20l-10 96zM490 100 480 4h20l-10 96zM510 100 500 4h20l-10 96zM530 100 520 4h20l-10 96zM550 100 540 4h20l-10 96zM570 100 560 4h20l-10 96zM590 100 580 4h20l-10 96zM610 100 600 4h20l-10 96zM630 100 620 4h20l-10 96zM650 100 640 4h20l-10 96zM670 100 660 4h20l-10 96zM690 100 680 4h20l-10 96zM710 100 700 4h20l-10 96zM730 100 720 4h20l-10 96zM750 100 740 4h20l-10 96zM770 100 760 4h20l-10 96zM790 100 780 4h20l-10 96zM810 100 800 4h20l-10 96zM830 100 820 4h20l-10 96zM850 100 840 4h20l-10 96zM870 100 860 4h20l-10 96zM890 100 880 4h20l-10 96zM910 100 900 4h20l-10 96zM930 100 920 4h20l-10 96zM950 100 940 4h20l-10 96zM970 100 960 4h20l-10 96zM990 100 980 4h20l-10 96z" />
        </svg>
      </div>
      {/* Newsletter Strip */}
      <div className="border-b border-white/10">
        <div className="section-container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Abonnez-vous à notre newsletter</h3>
            <p className="text-sm text-white/60 mt-0.5">Recevez les dernières offres et nouveautés</p>
          </div>
          <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Votre adresse email..."
              className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-white/10 border border-white/15
                         text-sm text-white placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50
                         transition-all"
            />
            <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
              S&apos;abonner
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="font-bold text-lg leading-none">KARKACHI</span>
                <span className="block text-[10px] text-white/50 tracking-[0.2em] uppercase -mt-0.5">
                  Phone
                </span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Votre destination premium à Marrakech (4 Magasins). Dirigé par Mohamed Zakaria KARKACHI.
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon) => {
                const key = crypto.randomUUID()
                return (
                  <Link
                    key={key}
                    href="/"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-deprecated */}
                    <Icon className="w-4 h-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Boutique</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-orange-400" />
                <span>Marrakech, Maroc (4 Magasins)</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="w-4 h-4 shrink-0 text-orange-400" />
                <span>+212 676-423340</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail className="w-4 h-4 shrink-0 text-orange-400" />
                <span>contact@karkachiphone.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} KARKACHI PHONE. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  )
}
