"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import FullscreenProductCard from "@/components/fullscreen-product-card"
import FullscreenCarousel from "@/components/fullscreen-carousel"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, Grid2X2, Maximize2, ArrowRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/lib/types"

interface ApiResponse {
  success: boolean
  message: string
  data: {
    items?: any[]
    total?: number
    page?: number
    limit?: number
  } | any[]
}

const normalizeProduct = (item: any): Product => {
  const price = Number.parseFloat(item.price) || 0
  const originalPrice = item.originalPrice ? Number.parseFloat(item.originalPrice) : undefined
  const savePercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined
  return {
    id: item.id?.toString() || item.id || "",
    name: item.name || "",
    description: item.description || "",
    price,
    comparePrice: originalPrice,
    savePrice: savePercentage ? savePercentage.toString() : undefined,
    brand: item.brand ? { name: item.brand.name || "" } : undefined,
    category: item.categoryId || null,
    stock: item.stock ?? 0,
    rating: Number.parseFloat(item.rating) || 0,
    reviewCount: item.reviewsCount || item.reviewCount || 0,
    image: item.images?.[0]?.url || item.image || null,
    isOnPromotion: item.isFlashDeal || item.isPromotional || !!originalPrice || false,
    promotionEndDate: item.flashEndsAt || null,
    specs: item.specs?.map((s: any) => ({ key: s.key || "", value: s.value })) || []
  } as any
}

function buildQueryParams({ skip, limit, query, category, brand, minPrice, maxPrice }: any): string {
  const params = new URLSearchParams()
  params.append("skip", skip.toString())
  params.append("limit", limit.toString())

  if (query) params.append("q", query)
  if (category !== "all") params.append("categoryId", category)
  if (brand !== "all") params.append("brandId", brand)
  if (minPrice > 0) params.append("priceMin", minPrice.toString())
  if (maxPrice < 50000) params.append("priceMax", maxPrice.toString())
  
  return params.toString()
}

const urlBase = process.env.NEXT_PUBLIC_API_URL

function FilterWidgets({
  selectedCategory, setSelectedCategory, categories,
  selectedBrand, setSelectedBrand, brands,
  priceRange, setPriceRange
}: any) {
  return (
    <Accordion type="multiple" defaultValue={["categories", "brands", "price"]} className="space-y-6">
      <AccordionItem value="categories" className="border-none">
        <AccordionTrigger className="font-bold text-foreground py-2 hover:no-underline">Catégories</AccordionTrigger>
        <AccordionContent className="pt-2">
          <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-3">
            <div className="flex items-center space-x-3 group">
              <RadioGroupItem value="all" id="cat-all" className="border-orange-500/50 text-orange-500 focus-visible:ring-orange-500" />
              <Label htmlFor="cat-all" className="cursor-pointer text-sm font-medium group-hover:text-accent transition-colors">Toutes les catégories</Label>
            </div>
            {categories.map((cat: any) => (
              <div key={cat.id} className="flex items-center space-x-3 group">
                <RadioGroupItem value={cat.id} id={`cat-${cat.id}`} className="border-orange-500/50 text-orange-500 focus-visible:ring-orange-500" />
                <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer text-sm font-medium group-hover:text-accent transition-colors">{cat.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="brands" className="border-none">
        <AccordionTrigger className="font-bold text-foreground py-2 hover:no-underline">Marques</AccordionTrigger>
        <AccordionContent className="pt-2">
          <RadioGroup value={selectedBrand} onValueChange={setSelectedBrand} className="space-y-3">
            <div className="flex items-center space-x-3 group">
              <RadioGroupItem value="all" id="brand-all" className="border-orange-500/50 text-orange-500 focus-visible:ring-orange-500" />
              <Label htmlFor="brand-all" className="cursor-pointer text-sm font-medium group-hover:text-accent transition-colors">Toutes les marques</Label>
            </div>
            {brands.map((brand: any) => (
              <div key={brand.id} className="flex items-center space-x-3 group">
                <RadioGroupItem value={brand.id} id={`brand-${brand.id}`} className="border-orange-500/50 text-orange-500 focus-visible:ring-orange-500" />
                <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer text-sm font-medium group-hover:text-accent transition-colors">{brand.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price" className="border-none">
        <AccordionTrigger className="font-bold text-foreground py-2 hover:no-underline">Prix (MAD)</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <Slider
            defaultValue={[0, 50000]}
            max={50000}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mt-2"
          />
          <div className="flex items-center justify-between text-sm text-foreground font-bold bg-secondary/30 px-3 py-2 rounded-lg mt-4">
            <span>{priceRange[0]} MAD</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span>{priceRange[1]} MAD</span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function MainContent({ loading, error, products, viewMode, hasMore, fetchingMore, totalResults, handleRetry, isInWishlist, removeFromWishlist, addToWishlist }: any) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 12 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-secondary/5">
        <p className="text-destructive font-bold text-xl mb-6">Une erreur s&apos;est produite.</p>
        <Button onClick={handleRetry} variant="default" size="lg" className="rounded-full px-10">Réessayer</Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-24 bg-secondary/5 rounded-3xl border-2 border-dashed">
        <p className="text-2xl font-black uppercase mb-2">Aucun produit</p>
        <p className="text-lg">Essayez d'ajuster vos filtres pour voir plus de résultats.</p>
      </div>
    )
  }

  return (
    <>
      {viewMode === 'fullscreen' ? (
        <FullscreenCarousel>
          {products.map((product: any) => (
            <FullscreenProductCard key={product.id} product={product} />
          ))}
        </FullscreenCarousel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {products.map((product: any) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isInWishlist={isInWishlist(product.id)}
              onToggleWishlist={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
            />
          ))}
        </div>
      )}

      {(!viewMode || viewMode === 'grid') && (
        <div className="mt-12 mb-8 flex justify-center">
          {fetchingMore && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-muted-foreground animate-pulse">Chargement...</p>
            </div>
          )}
          {!hasMore && products.length > 0 && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider py-8">
              Vous avez vu tous les produits ({totalResults})
            </p>
          )}
        </div>
      )}
    </>
  )
}

export default function ProductsPage() {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hasMore, setHasMore] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [error, setError] = useState(false)
  
  const [viewMode, setViewMode] = useState<'grid' | 'fullscreen'>('grid')

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search)
    const search = params.get("search")
    if (search) {
      setSearchQuery(search)
    }
  }, [])

  useEffect(() => {
    if (viewMode === 'fullscreen') {
      document.body.style.overflowY = 'hidden'
    } else {
      document.body.style.overflowY = ''
    }
    return () => { document.body.style.overflowY = '' }
  }, [viewMode])

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string, name: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000])

  const fetchLookups = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch(`${urlBase}/public/category`),
        fetch(`${urlBase}/public/brands/logo`)
      ])

      if (catRes.ok) {
        const catData = await catRes.json()
        let catArr = []
        if (catData.success && Array.isArray(catData.data)) {
          catArr = catData.data
        } else if (Array.isArray(catData)) {
          catArr = catData
        }
        setCategories(catArr)
      }

      if (brandRes.ok) {
        const brandData = await brandRes.json()
        setBrands(brandData.success && Array.isArray(brandData.data) ? brandData.data : [])
      }
    } catch (error) {
      console.error("Error fetching lookups:", error)
    }
  }

  const fetchProducts = async (isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setFetchingMore(true)
      } else {
        setLoading(true)
        setProducts([])
      }
      setError(false)
      
      const currentSkip = isLoadMore ? products.length : 0
      const currentLimit = currentSkip === 0 ? 15 : 10

      const queryString = buildQueryParams({
        skip: currentSkip,
        limit: currentLimit,
        query: searchQuery.trim(),
        category: selectedCategory,
        brand: selectedBrand,
        minPrice: priceRange[0],
        maxPrice: priceRange[1]
      })

      const response = await fetch(`${urlBase}/public/products?${queryString}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Impossible de récupérer les produits")
      }
      const data: ApiResponse = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Erreur lors de la récupération des produits")
      }

      const responseData = data.data
      let items: any[] = []
      let total: number = 0

      if (responseData && typeof responseData === 'object' && 'items' in responseData) {
        items = (responseData as any).items || []
        total = (responseData as any).total || 0
      }

      const normalizedProducts: Product[] = items.map((item: any) => normalizeProduct(item))

      if (isLoadMore) {
        setProducts(prev => [...prev, ...normalizedProducts])
      } else {
        setProducts(normalizedProducts)
      }
      
      setTotalResults(total)
      setHasMore((currentSkip + normalizedProducts.length) < total)
      
    } catch (error: any) {
      console.error("Erreur de fetch des produits:", error.message)
      setError(true)
    } finally {
      setLoading(false)
      setFetchingMore(false)
    }
  }

  useEffect(() => {
    fetchLookups()
  }, [])

  useEffect(() => {
    fetchProducts(false)
  }, [selectedCategory, selectedBrand, priceRange])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        hasMore &&
        !loading &&
        !fetchingMore
      ) {
        fetchProducts(true)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [products, hasMore, loading, fetchingMore])

  const handleRetry = () => fetchProducts(false)

  const filterProps = {
    selectedCategory, setSelectedCategory, categories,
    selectedBrand, setSelectedBrand, brands,
    priceRange, setPriceRange
  }

  return (
    <div className="min-h-screen bg-background pt-4 md:pt-8 pb-20">
      {/* Dynamic Wide Container: Same look as homepage */}
      <div className="w-full px-4 md:px-8 lg:px-12 pt-1 pb-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border/40 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase">
              Catalogue <span className="text-accent underline decoration-4 decoration-accent/20 underline-offset-8">Premium</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-xl font-medium max-w-2xl">
              L'excellence technologique à portée de main. Explorez nos dernières arrivées.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-secondary/80 backdrop-blur-sm rounded-xl p-0.5 md:hidden border border-border/40">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('grid')}
                className={`h-10 w-10 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-accent' : 'text-muted-foreground'}`}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('fullscreen')}
                className={`h-10 w-10 rounded-lg transition-all ${viewMode === 'fullscreen' ? 'bg-white shadow-sm text-accent' : 'text-muted-foreground'}`}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="md:hidden w-full">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs border-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtrer la sélection
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden bg-background">
                  <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-3 mb-6" />
                  <DrawerHeader>
                    <DrawerTitle className="text-2xl font-black uppercase">Filtres</DrawerTitle>
                    <DrawerDescription className="text-base">Affinez votre recherche par catégorie, marque ou prix.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-6 py-8">
                    <FilterWidgets {...filterProps} />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>

        {/* Workspace: Sticky Sidebar vs Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
          
          {/* STICKY SIDEBAR */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-2">
            <div className="sticky top-[104px] md:top-[184px] self-start max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-6 pb-10">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Filtrer par</h2>
                  <FilterWidgets {...filterProps} />
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="col-span-1 md:col-span-9 lg:col-span-10">
            <MainContent 
              loading={loading}
              error={error}
              products={products}
              viewMode={viewMode}
              hasMore={hasMore}
              fetchingMore={fetchingMore}
              totalResults={totalResults}
              handleRetry={handleRetry}
              isInWishlist={isInWishlist}
              removeFromWishlist={removeFromWishlist}
              addToWishlist={addToWishlist}
            />
          </main>
        </div>
      </div>
    </div>
  )
}