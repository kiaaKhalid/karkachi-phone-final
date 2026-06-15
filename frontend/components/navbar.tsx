"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  Sun,
  Moon,
  Truck,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useTheme } from "next-themes"
import Logo from "@/components/logo"

import { NAV_LINKS } from "@/lib/nav-config"

export default function Navbar() {
  const [currentInfoIndex, setCurrentInfoIndex] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLFormElement>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { totalItems } = useCart()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInfoIndex((prev) => (prev + 1) % 2)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(globalThis.scrollY > 10)
    globalThis.addEventListener("scroll", onScroll, { passive: true })
    return () => globalThis.removeEventListener("scroll", onScroll)
  }, [])

  // Close search results dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search queries fetching from products search endpoint
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    const delayDebounceFn = setTimeout(() => {
      setSearchLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      fetch(`${apiUrl}/public/products?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data && Array.isArray(data.data.items)) {
            setSearchResults(data.data.items.slice(0, 6)) // Show top 6 matches
            setShowDropdown(true)
          } else {
            setSearchResults([])
          }
        })
        .catch((err) => {
          console.error("Search fetch error:", err)
          setSearchResults([])
        })
        .finally(() => {
          setSearchLoading(false)
        })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
    }
  }

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            Recherche en cours...
          </div>
        </div>
      )
    }

    if (searchResults.length > 0) {
      return (
        <div className="flex flex-col max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-border/40">
          {searchResults.map((product) => {
            const price = Number(product.flashPrice || product.price) || 0
            const getImageUrl = (img: string | null | undefined) => {
              if (!img) return "/Placeholder.png"
              if (img.startsWith("http") || img.startsWith("data:")) return img
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
              const baseUrl = apiUrl.replace(/\/api$/, "")
              const cleanImg = img.startsWith("/") ? img : `/${img}`
              return `${baseUrl}${cleanImg}`
            }
            
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  router.push(`/products/${product.id}`)
                  setShowDropdown(false)
                  setSearchQuery("")
                }}
                className="w-full text-left flex items-center justify-between p-3 hover:bg-secondary/50 dark:hover:bg-secondary/20 transition-colors cursor-pointer focus:outline-none focus:bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 bg-white rounded-lg border border-border/30 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-foreground line-clamp-1 hover:text-orange-500 transition-colors">
                      {product.name}
                    </h4>
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                    )}
                  </div>
                </div>
                <div className="text-right pl-4">
                  <span className="text-sm font-black text-orange-500 whitespace-nowrap">
                    {price.toLocaleString("fr-MA")} DH
                  </span>
                </div>
              </button>
            )
          })}
          
          {/* View all results link */}
          <button 
            type="button"
            onClick={() => {
              router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
              setShowDropdown(false)
            }}
            className="w-full p-3 text-center text-xs font-bold text-orange-500 hover:bg-secondary/35 cursor-pointer border-t border-border/40 focus:outline-none focus:bg-secondary/30"
          >
            Voir tous les résultats pour "{searchQuery}" →
          </button>
        </div>
      )
    }

    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Aucun produit trouvé pour "{searchQuery}"
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-md">
      {/* ── 1. TOP ANNOUNCEMENT BAR (Plus fine) ── */}
      <div className="bg-[#0f172a] text-white h-8 md:h-9 flex items-center border-b border-white/5">
        <div className="w-full px-4 md:px-10 xl:px-16 flex justify-between items-center text-[10px] md:text-xs font-light">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-orange-400 transition-colors cursor-pointer">
              <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" /> +212 676-423340
            </span>
            <span className="hidden md:flex items-center gap-1.5 opacity-70">
              <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" /> Marrakech, Maroc
            </span>
          </div>

          <div className="flex-1 text-center hidden md:block">
            <p className={`transition-all duration-700 ${currentInfoIndex === 1 ? "opacity-100 translate-y-0" : "opacity-0 absolute inset-x-0 translate-y-2"}`}>
              <Truck className="inline w-3.5 h-3.5 mr-2" /> Livraison Gratuite dès 300 DH partout au Maroc 🇲🇦
            </p>
            <p className={`transition-all duration-700 ${currentInfoIndex === 0 ? "opacity-100 translate-y-0" : "opacity-0 absolute inset-x-0 -translate-y-2"}`}>
              ASSISTANCE CLIENT DISPONIBLE 24/7
            </p>
          </div>

          <div className="font-bold text-orange-400 text-[10px] uppercase tracking-widest">
            Karkachi Phone
          </div>
        </div>
      </div>

      {/* ── 2. MAIN HEADER (Dimensions réduites) ── */}
      <header className={`transition-all duration-300 border-b border-border ${isScrolled ? "py-1 shadow-md" : "py-2.5 lg:py-3.5 xl:py-4 xxl:py-6"}`}>
        <div className="w-full px-4 md:px-10 xl:px-16">
          <div className="flex items-center justify-between gap-6 lg:gap-10">
            
            {/* Logo : Taille modérée (Scale 1.15 au lieu de 1.4) */}
            <div className="flex-shrink-0 transition-transform lg:scale-95 xl:scale-100 xxl:scale-115 origin-left">
              <Logo />
            </div>

            {/* Barre de Recherche : Plus fine (py-2.5 au lieu de py-5) */}
            <form 
              ref={searchRef}
              onSubmit={handleSearch} 
              className="hidden md:flex flex-1 max-w-[500px] lg:max-w-[700px] xl:max-w-[900px] group relative"
            >
              <div className="relative w-full rounded-xl overflow-hidden bg-secondary/20 hover:bg-secondary/30 transition-all border border-transparent focus-within:border-orange-500/30">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-orange-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-11 pr-5 py-2 lg:py-2.5 xl:py-2.5 xxl:py-3.5 bg-transparent outline-none text-sm lg:text-base border border-orange-500/30"
                />
              </div>

              {/* Search Dropdown Results Popup */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {renderSearchResults()}
                </div>
              )}
            </form>

            {/* Actions : Icônes réduites (w-6 au lieu de w-9) */}
            <nav className="flex items-center gap-1 md:gap-3 lg:gap-5">
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 lg:p-2 xl:p-2.5 xxl:p-3 rounded-full hover:bg-secondary transition-colors">
                {mounted && (theme === "dark" ? <Sun className="w-5 h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 xxl:h-10 xxl:w-10" /> : <Moon className="w-5 h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 xxl:h-10 xxl:w-10" />)}
              </button>

              <Link href="/wishlist" className="p-1.5 lg:p-2 xl:p-2.5 xxl:p-3 rounded-full hover:bg-secondary transition-colors hidden sm:block">
                <Heart className="w-5 h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 xxl:h-10 xxl:w-10" />
              </Link>

              <Link href="/cart" className="p-1.5 lg:p-2 xl:p-2.5 xxl:p-3 rounded-full hover:bg-secondary transition-colors relative">
                <ShoppingCart className="w-5 h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 xxl:h-10 xxl:w-10" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 xl:w-5 xl:h-5 xxl:w-6 xxl:h-6 rounded-full bg-orange-500 text-white text-[9px] lg:text-[10px] xxl:text-xs font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => isAuthenticated ? setUserMenuOpen(!userMenuOpen) : router.push("/auth/login")}
                  className="p-1.5 lg:p-2 xl:p-2.5 xxl:p-3 rounded-xl bg-orange-500/5 text-orange-600 hover:bg-orange-500/10 transition-colors"
                >
                  <User className="w-5 h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 xxl:h-10 xxl:w-10" />
                </button>
              </div>

              {/* Burger Mobile */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </nav>
          </div>

          {/* ── 3. LIENS DE NAVIGATION (Moins d'espacement) ── */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 xxl:gap-14 pt-3 lg:pt-3.5 xxl:pt-5 mt-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] lg:text-xs xl:text-sm xxl:text-base font-bold uppercase tracking-[0.1em] transition-all relative group ${
                  pathname === link.href ? "text-orange-500" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ── 4. MENU MOBILE ── */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t p-4 flex flex-col gap-3 animate-in slide-in-from-top duration-200 shadow-xl">
           {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold py-2 border-b border-border/50">{link.label}</Link>
          ))}
        </div>
      )}
    </div>
  )
}