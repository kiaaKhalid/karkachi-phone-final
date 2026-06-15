"use client"

import type React from "react"
import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

interface AddBrandDialogProps {
  readonly onBrandAdded: () => void
}

export default function AddBrandDialog({ onBrandAdded }: AddBrandDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
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

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      logo: "",
      country: "",
      website: "",
      isActive: true,
      isFeatured: false,
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetForm()
    }
    setIsOpen(open)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Brand name and slug are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${url}/admin/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description || undefined,
          logo: formData.logo || undefined,
          country: formData.country || undefined,
          website: formData.website || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Brand created successfully",
        })
        onBrandAdded()
        setIsOpen(false)
        resetForm()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create brand",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating brand:", error)
      toast({
        title: "Error",
        description: "Failed to create brand",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (name: string) => {
    const slug = name
      ? name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : ""

    setFormData((prev) => ({ ...prev, name, slug }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#01A0EA] hover:bg-[#0190D4]">
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0 sm:rounded-3xl">
        <DialogHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-[22px] font-bold text-gray-900 tracking-tight">
            Add New Brand
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6 max-h-[calc(95vh-100px)] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[15px] font-medium text-gray-800">
              Brand Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter brand name"
              required
              className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[15px] font-medium text-gray-800">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter Description"
              rows={3}
              className="bg-white border-gray-200 rounded-xl p-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all resize-none placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-[15px] font-medium text-gray-800">
                URL Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="brand-url-slug"
                required
                className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-[15px] font-medium text-gray-800">
                Country
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="e.g. South Korea"
                className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-[15px] font-medium text-gray-800">
              Add Brand Logo
            </Label>
            <ImageUpload
              value={formData.logo}
              onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-[15px] font-medium text-gray-800">
                Brand Status
              </Label>
              <p className="text-sm text-gray-500">
                Visible to customers
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isFeatured" className="text-[15px] font-medium text-gray-800">
                Featured Brand
              </Label>
              <p className="text-sm text-gray-500">
                Show on homepage / highlighted sections
              </p>
            </div>
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
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
                  Creating...
                </>
              ) : (
                "Create New Brand"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}