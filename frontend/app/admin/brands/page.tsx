"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Search, Filter, Power, Loader2, ImageIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import AddBrandDialog from "@/components/admin/add-brand-dialog"
import EditBrandDialog from "@/components/admin/edit-brand-dialog"

interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  description: string
  productCount: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export default function ManageBrands() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      router.push("/")
      return
    }
    loadBrands()
  }, [user, router])

  const loadBrands = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/admin/brands?page=1&limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBrands(data.items || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load brands",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading brands:", error)
      toast({
        title: "Error",
        description: "Failed to load brands",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }))

    try {
      // In a real scenario, this might be a specific deactivate/activate endpoint, 
      // but let's assume we toggle it using the PUT endpoint or a specific PATCH endpoint 
      // similar to categories
      const endpoint = currentStatus
        ? `${url}/admin/brands/${id}/deactivate`
        : `${url}/admin/brands/${id}/activate`

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: currentStatus ? "Brand deactivated" : "Brand activated",
        })
        loadBrands()
      } else {
        toast({
          title: "Error",
          description: "Failed to update brand status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling brand status:", error)
      toast({
        title: "Error",
        description: "Failed to update brand status",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setIsEditDialogOpen(true)
  }

  const filteredBrands = brands.filter((brand) => {
    if (filterStatus !== "all") {
      if (filterStatus === "active" && !brand.isActive) return false
      if (filterStatus === "inactive" && brand.isActive) return false
    }
    if (searchTerm) {
      return (
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return true
  })

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -mt-16">
      <div className="container mx-auto px-4 py-8 -mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-blue mb-2">Manage Brands</h1>
          <p className="text-lg text-high-contrast">
            Create, edit, and organize product brands
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          <AddBrandDialog onBrandAdded={loadBrands} />
        </div>

        {/* Brands Table */}
        <Card className="glass border-visible shadow-elegant">
          <CardHeader>
            <CardTitle className="text-high-contrast">Brands ({brands.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="text-high-contrast">Brand</TableHead>
                      <TableHead className="text-high-contrast">Description</TableHead>
                      <TableHead className="text-high-contrast">Products</TableHead>
                      <TableHead className="text-high-contrast">Featured</TableHead>
                      <TableHead className="text-high-contrast">Status</TableHead>
                      <TableHead className="text-high-contrast">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBrands.map((brand) => (
                      <TableRow key={brand.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                              {brand.logo ? (
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-high-contrast">{brand.name}</p>
                              <p className="text-sm text-medium-contrast">/{brand.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-medium-contrast max-w-xs truncate">{brand.description || "N/A"}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {brand.productCount || 0} products
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {brand.isFeatured ? (
                            <Badge variant="outline" className="border-purple-500 text-purple-600">Featured</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                brand.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${brand.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                              {brand.isActive ? "Active" : "Inactive"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(brand)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStatus(brand.id, brand.isActive)}
                              disabled={loadingStates[brand.id]}
                              className={`p-2 ${
                                brand.isActive
                                  ? "hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                  : "hover:bg-green-50 dark:hover:bg-green-900/20"
                              }`}
                            >
                              {loadingStates[brand.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Power className={`h-4 w-4 ${brand.isActive ? "text-orange-600" : "text-green-600"}`} />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <EditBrandDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          brand={editingBrand}
          onBrandUpdated={loadBrands}
        />
      </div>
    </div>
  )
}
