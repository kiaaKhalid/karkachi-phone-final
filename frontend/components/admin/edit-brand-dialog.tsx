"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/ui/image-upload"

interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  country?: string
  website?: string
  description: string
  productCount: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

interface EditBrandDialogProps {
  readonly isOpen: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly brand: Brand | null
  readonly onBrandUpdated: () => void
}

export default function EditBrandDialog({ isOpen, onOpenChange, brand, onBrandUpdated }: EditBrandDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    country: "",
    website: "",
    isActive: true,
    isFeatured: false,
  })
  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (brand && isOpen) {
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        logo: brand.logo || "",
        country: brand.country || "",
        website: brand.website || "",
        isActive: brand.isActive,
        isFeatured: brand.isFeatured,
      })
    }
  }, [brand, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!brand || !formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Brand name and slug are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${url}/admin/brands/${brand.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description || undefined,
          logo: formData.logo || undefined,
          country: formData.country || undefined,
          website: formData.website || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update brand")
      }

      onBrandUpdated()
      onOpenChange(false)

      toast({
        title: "Success",
        description: "Brand updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update brand",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0 sm:rounded-3xl">
        <DialogHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-[22px] font-bold text-gray-900 tracking-tight">
            Edit Brand
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6 max-h-[calc(95vh-100px)] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-[15px] font-medium text-gray-800">
              Brand Name
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter brand name"
              required
              disabled={isLoading}
              className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-[15px] font-medium text-gray-800">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter brand description"
              rows={3}
              disabled={isLoading}
              className="bg-white border-gray-200 rounded-xl p-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all resize-none placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-slug" className="text-[15px] font-medium text-gray-800">
                URL Slug
              </Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="brand-url-slug"
                required
                disabled={isLoading}
                className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country" className="text-[15px] font-medium text-gray-800">
                Country
              </Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. South Korea"
                disabled={isLoading}
                className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-[15px] font-medium text-gray-800">
              Brand Logo
            </Label>
            <ImageUpload
              value={formData.logo}
              onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="edit-isActive" className="text-[15px] font-medium text-gray-800">
                Brand Status
              </Label>
              <p className="text-sm text-gray-500">
                Visible to customers
              </p>
            </div>
            <Switch
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="edit-isFeatured" className="text-[15px] font-medium text-gray-800">
                Featured Brand
              </Label>
              <p className="text-sm text-gray-500">
                Show on homepage / highlighted sections
              </p>
            </div>
            <Switch
              id="edit-isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-12 px-8 rounded-full border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.slug.trim()}
              className="h-12 px-8 rounded-full bg-[#202020] hover:bg-black text-white font-medium shadow-sm transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Brand"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}