"use client"

import type React from "react"
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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  description: string
  isActive: boolean
  sortOrder: number
  isRebone: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

interface EditCategoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  category: Category | null
}

export default function EditCategoryDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  category,
}: Readonly<EditCategoryDialogProps>) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    sortOrder: 0,
    isRebone: false,
  })
  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        isRebone: category.isRebone,
      })
    }
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Category name and slug are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${url}/admin/categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          image: formData.image || undefined,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
          isRebone: formData.isRebone,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
        onSuccess()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update category",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category",
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0 sm:rounded-3xl">
        <DialogHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-[22px] font-bold text-gray-900 tracking-tight">
            Edit Category
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6 max-h-[calc(95vh-100px)] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[15px] font-medium text-gray-800">
              Category Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter category name"
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
                placeholder="category-url-slug"
                required
                className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-[15px] font-medium text-gray-800">
                Sort Order
              </Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number.parseInt(e.target.value, 10) || 0 }))}
                placeholder="0"
                min={0}
                className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[15px] shadow-sm hover:border-gray-300 focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-[15px] font-medium text-gray-800">
              Update Category Image
            </Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-[15px] font-medium text-gray-800">
                Category Status
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
              <Label htmlFor="isRebone" className="text-[15px] font-medium text-gray-800">
                Rebone Category
              </Label>
              <p className="text-sm text-gray-500">
                Enable rebone features
              </p>
            </div>
            <Switch
              id="isRebone"
              checked={formData.isRebone}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isRebone: checked }))}
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
                "Update Category"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}