"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/lib/types"

interface Deal {
  id: string
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  stock: number
  rating: string
  reviewsCount: number
  discount: number | null
  isFlashDeal: boolean
  flashPrice: string | null
  flashStartsAt: string
  flashEndsAt: string
  flashStock: number | null
  categoryId: string
  brandId: string
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const fetchDeals = async (isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setFetchingMore(true)
      } else {
        setLoading(true)
        setDeals([])
      }
      setError(null)

      const currentSkip = isLoadMore ? deals.length : 0
      const currentLimit = currentSkip === 0 ? 15 : 10

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products/deals?skip=${currentSkip}&limit=${currentLimit}`)
      if (!res.ok) throw new Error("Erreur de chargement")
      const data = await res.json()
      
      const newDeals = data.data.items || []
      const total = data.data.total || 0

      if (isLoadMore) {
        setDeals(prev => [...prev, ...newDeals])
      } else {
        setDeals(newDeals)
      }
      
      setTotalResults(total)
      setHasMore((currentSkip + newDeals.length) < total)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
      setFetchingMore(false)
    }
  }

  useEffect(() => {
    fetchDeals(false)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        hasMore &&
        !loading &&
        !fetchingMore
      ) {
        fetchDeals(true)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [deals, hasMore, loading, fetchingMore])

  const convertToProduct = (deal: Deal): Product => ({
    id: deal.id,
    name: deal.name,
    brand: "",
    category: "",
    price: Number.parseFloat(deal.flashPrice || deal.price),
    originalPrice: Number.parseFloat(deal.originalPrice),
    image: deal.image,
    rating: Number.parseFloat(deal.rating),
    reviewsCount: deal.reviewsCount,
    stock: deal.flashStock ?? deal.stock,
    description: deal.description,
    discount: deal.discount ?? undefined,
    isFlashDeal: deal.isFlashDeal,
    flashPrice: deal.flashPrice ? Number.parseFloat(deal.flashPrice) : null,
  })

  let content;
  if (loading) {
    content = (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => {
          const key = `skeleton-${i}`
          return <ProductCardSkeleton key={key} />
        })}
      </div>
    );
  } else if (deals.length > 0) {
    content = (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {deals.map((deal) => {
            const product = convertToProduct(deal)
            const sId = deal.id.toString()
            return (
              <ProductCard
                key={sId}
                product={product as any}
                isInWishlist={isInWishlist(sId)}
                onToggleWishlist={() => 
                  isInWishlist(sId) ? removeFromWishlist(sId) : addToWishlist({ ...product, id: sId })
                }
              />
            )
          })}
        </div>

        {/* INFINITE SCROLL LOADER */}
        <div className="mt-12 mb-8 flex justify-center">
          {fetchingMore && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-muted-foreground animate-pulse">Chargement...</p>
            </div>
          )}
          {!hasMore && deals.length > 0 && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider py-8">
              Vous avez vu toutes les offres ({totalResults})
            </p>
          )}
        </div>
      </>
    );
  } else {
    content = (
      <div className="text-center py-24 bg-secondary/30 rounded-[3rem] border border-dashed border-border/60">
        <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Aucune offre flash disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-4 text-foreground font-inter">
      <div className="section-container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-current" />
              Offres Limitées
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Meilleures <span className="text-accent">Offres</span> du Jour
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl">
              Des réductions exceptionnelles sur une sélection de produits premium. Profitez-en avant l&apos;expiration.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 rounded-2xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {content}
      </div>
    </div>
  )
}