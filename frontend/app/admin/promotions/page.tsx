"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Promotion {
  id: string
  title: string
  code: string
  type: "percentage" | "fixed" | "free_shipping"
  value: number
  minimumOrderAmount: number
  isActive: boolean
}

export default function ManagePromotions() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    type: "percentage",
    value: "0",
    minimumOrderAmount: "0",
    isActive: true
  })

  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      router.push("/")
      return
    }
    loadPromotions()
  }, [user, router])

  const loadPromotions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/promotions/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPromotions(data.data || [])
      }
    } catch (error) {
      console.error("Error loading promotions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openAddDialog = () => {
    setEditingPromo(null)
    setFormData({ title: "", code: "", type: "percentage", value: "0", minimumOrderAmount: "0", isActive: true })
    setIsDialogOpen(true)
  }

  const openEditDialog = (promo: Promotion) => {
    setEditingPromo(promo)
    setFormData({
      title: promo.title,
      code: promo.code,
      type: promo.type,
      value: promo.value.toString(),
      minimumOrderAmount: promo.minimumOrderAmount.toString(),
      isActive: promo.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce code promo ?")) return
    
    try {
      const response = await fetch(`${url}/promotions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })
      
      if (response.ok) {
        toast({ title: "Succès", description: "Code promo supprimé" })
        loadPromotions()
      }
    } catch (error) {
      console.error("Delete promo error:", error)
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        title: formData.title,
        code: formData.code,
        type: formData.type,
        value: Number(formData.value),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        isActive: formData.isActive
      }
      
      const endpoint = editingPromo ? `${url}/promotions/${editingPromo.id}` : `${url}/promotions`
      const method = editingPromo ? "PUT" : "POST"
      
      const response = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}` 
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        toast({ title: "Succès", description: "Code promo enregistré" })
        setIsDialogOpen(false)
        loadPromotions()
      } else {
        toast({ title: "Erreur", description: "Vérifiez vos champs", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Erreur", description: "Erreur de connexion", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -mt-16">
      <div className="container mx-auto px-4 py-8 -mt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient-blue mb-2">Codes Promo</h1>
            <p className="text-lg text-high-contrast">Gérez les codes de réduction de votre boutique</p>
          </div>
          <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>

        <Card className="glass border-visible shadow-elegant">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Commande Min</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">{promo.title}</TableCell>
                      <TableCell className="font-bold text-orange-500">{promo.code}</TableCell>
                      <TableCell>
                        {(() => {
                           if (promo.type === "percentage") return "Pourcentage"
                           if (promo.type === "fixed") return "Montant fixe"
                           return "Livraison Gratuite"
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          if (promo.type === "percentage") return `${promo.value}%`
                          if (promo.type === "fixed") return `${promo.value} MAD`
                          return "-"
                        })()}
                      </TableCell>
                      <TableCell>{promo.minimumOrderAmount} MAD</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(promo)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(promo.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {promotions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun code promo défini</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Add/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPromo ? "Modifier le code promo" : "Ajouter un code promo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre de l'offre</Label>
                  <Input placeholder="Soldes d'été" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Code (ex: SUMMER20)</Label>
                  <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de réduction</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                      <SelectItem value="fixed">Montant fixe (MAD)</SelectItem>
                      <SelectItem value="free_shipping">Livraison Gratuite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.type !== "free_shipping" && (
                  <div className="space-y-2">
                    <Label>Valeur ({formData.type === "percentage" ? "%" : "MAD"})</Label>
                    <Input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Montant Minimum de Commande (MAD)</Label>
                <Input type="number" value={formData.minimumOrderAmount} onChange={e => setFormData({...formData, minimumOrderAmount: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.code || !formData.title}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
