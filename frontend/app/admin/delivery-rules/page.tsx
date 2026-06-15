"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface DeliveryRule {
  id: string
  name: string
  minOrderAmount: number
  maxOrderAmount: number | null
  price: number
  isActive: boolean
}

export default function ManageDeliveryRules() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [rules, setRules] = useState<DeliveryRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingRule, setEditingRule] = useState<DeliveryRule | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    minOrderAmount: "0",
    maxOrderAmount: "",
    price: "0",
    isActive: true
  })

  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      router.push("/")
      return
    }
    loadRules()
  }, [user, router])

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/delivery-rules/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        setRules(data.data || [])
      }
    } catch (error) {
      console.error("Error loading rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openAddDialog = () => {
    setEditingRule(null)
    setFormData({ name: "", minOrderAmount: "0", maxOrderAmount: "", price: "0", isActive: true })
    setIsDialogOpen(true)
  }

  const openEditDialog = (rule: DeliveryRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      minOrderAmount: rule.minOrderAmount.toString(),
      maxOrderAmount: rule.maxOrderAmount ? rule.maxOrderAmount.toString() : "",
      price: rule.price.toString(),
      isActive: rule.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette règle ?")) return
    
    try {
      const response = await fetch(`${url}/delivery-rules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })
      
      if (response.ok) {
        toast({ title: "Succès", description: "Règle supprimée" })
        loadRules()
      }
    } catch (error) {
      console.error("Delete rule error:", error)
      toast({ title: "Erreur", description: "Impossible de supprimer la règle", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        name: formData.name,
        minOrderAmount: Number(formData.minOrderAmount),
        maxOrderAmount: formData.maxOrderAmount ? Number(formData.maxOrderAmount) : null,
        price: Number(formData.price),
        isActive: formData.isActive
      }
      
      const endpoint = editingRule ? `${url}/delivery-rules/${editingRule.id}` : `${url}/delivery-rules`
      const method = editingRule ? "PUT" : "POST"
      
      const response = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}` 
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        toast({ title: "Succès", description: "Règle enregistrée" })
        setIsDialogOpen(false)
        loadRules()
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
            <h1 className="text-4xl font-bold text-gradient-blue mb-2">Règles de Livraison</h1>
            <p className="text-lg text-high-contrast">Gérez les tarifs de livraison selon le montant de la commande</p>
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
                    <TableHead>Nom</TableHead>
                    <TableHead>Montant Min</TableHead>
                    <TableHead>Montant Max</TableHead>
                    <TableHead>Frais de livraison</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.minOrderAmount} MAD</TableCell>
                      <TableCell>{rule.maxOrderAmount ? `${rule.maxOrderAmount} MAD` : "Sans limite"}</TableCell>
                      <TableCell className="font-bold text-orange-500">{rule.price === 0 ? "Gratuit" : `${rule.price} MAD`}</TableCell>
                      <TableCell>{rule.isActive ? "Actif" : "Inactif"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(rule)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune règle définie</TableCell>
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
              <DialogTitle>{editingRule ? "Modifier la règle" : "Ajouter une règle"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom (ex: Livraison Standard)</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant Minimum (MAD)</Label>
                  <Input type="number" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Montant Maximum (MAD)</Label>
                  <Input type="number" placeholder="Laissez vide si illimité" value={formData.maxOrderAmount} onChange={e => setFormData({...formData, maxOrderAmount: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Frais de livraison (MAD)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.name}>
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
