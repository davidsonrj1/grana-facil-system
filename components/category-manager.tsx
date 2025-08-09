"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Tag, Palette } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/app/page"
import ConfirmationModal from "@/components/confirmation-modal"

interface CategoryManagerProps {
  categories: Category[]
  onAddCategory: (category: Omit<Category, "id">) => void
  onDeleteCategory: (id: string) => void
}

const colorOptions = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Teal", value: "#06b6d4" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
]

export default function CategoryManager({ categories, onAddCategory, onDeleteCategory }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    color: colorOptions[0].value,
    type: "expense" as "income" | "expense" | "both",
  })

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null,
  })

  const handleDeleteClick = (categoryId: string) => {
    setDeleteModal({ isOpen: true, categoryId })
  }

  const handleDeleteConfirm = () => {
    if (deleteModal.categoryId) {
      onDeleteCategory(deleteModal.categoryId)
    }
    setDeleteModal({ isOpen: false, categoryId: null })
  }

  const getCategoryToDelete = () => {
    if (!deleteModal.categoryId) return null
    return categories.find((c) => c.id === deleteModal.categoryId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) return

    onAddCategory({
      name: formData.name.trim(),
      color: formData.color,
      type: formData.type,
    })

    setFormData({
      name: "",
      color: colorOptions[0].value,
      type: "expense",
    })
    setShowForm(false)
  }

  const getTypeLabel = (type: Category["type"]) => {
    switch (type) {
      case "income":
        return "Receita"
      case "expense":
        return "Despesa"
      case "both":
        return "Ambos"
    }
  }

  const getTypeBadgeVariant = (type: Category["type"]) => {
    switch (type) {
      case "income":
        return "default"
      case "expense":
        return "secondary"
      case "both":
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Gerenciar Categorias
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t bg-slate-50/50">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nome da Categoria</Label>
                  <Input
                    id="categoryName"
                    placeholder="Ex: Alimentação"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "income" | "expense" | "both") =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Palette className="w-4 h-4 mr-1" />
                    Cor
                  </Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                            <span>{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Adicionar Categoria
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Categories List */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-slate-800">Categorias Existentes ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Nenhuma categoria encontrada</p>
              <p className="text-slate-400 text-sm mt-2">
                Adicione sua primeira categoria para organizar suas transações
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                    <div>
                      <h4 className="font-semibold text-slate-900">{category.name}</h4>
                      <Badge variant={getTypeBadgeVariant(category.type)} className="text-xs mt-1">
                        {getTypeLabel(category.type)}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(category.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Categoria"
        message={
          getCategoryToDelete()
            ? `Tem certeza que deseja excluir a categoria "${getCategoryToDelete()?.name}"? Esta ação não pode ser desfeita e pode afetar transações existentes.`
            : "Tem certeza que deseja excluir esta categoria?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}
