"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Edit, Calendar, DollarSign, RefreshCw, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { RecurringTransaction, Category } from "@/app/page"
import ConfirmationModal from "@/components/confirmation-modal"

interface RecurringManagerProps {
  recurringTransactions: RecurringTransaction[]
  categories: Category[]
  onAddRecurring: (recurring: Omit<RecurringTransaction, "id">) => void
  onEditRecurring: (id: string, recurring: Omit<RecurringTransaction, "id">) => void
  onDeleteRecurring: (id: string) => void
  onProcessRecurring: () => void
}

export default function RecurringManager({
  recurringTransactions,
  categories,
  onAddRecurring,
  onEditRecurring,
  onDeleteRecurring,
  onProcessRecurring,
}: RecurringManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dayOfMonth: "",
    type: "expense" as "income" | "expense",
    category: "",
  })
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; recurringId: string | null }>({
    isOpen: false,
    recurringId: null,
  })

  const handleEditRecurring = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring)
    setFormData({
      name: recurring.name,
      amount: recurring.amount.toString(),
      dayOfMonth: recurring.dayOfMonth.toString(),
      type: recurring.type,
      category: recurring.category,
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.amount || !formData.dayOfMonth || !formData.category) return

    const recurringData = {
      name: formData.name.trim(),
      amount: Number.parseFloat(formData.amount),
      dayOfMonth: Number.parseInt(formData.dayOfMonth),
      type: formData.type,
      category: formData.category,
    }

    if (editingRecurring) {
      onEditRecurring(editingRecurring.id, recurringData)
    } else {
      onAddRecurring(recurringData)
    }

    setFormData({
      name: "",
      amount: "",
      dayOfMonth: "",
      type: "expense",
      category: "",
    })
    setShowForm(false)
    setEditingRecurring(null)
  }

  const handleDeleteClick = (recurringId: string) => {
    setDeleteModal({ isOpen: true, recurringId })
  }

  const handleDeleteConfirm = () => {
    if (deleteModal.recurringId) {
      onDeleteRecurring(deleteModal.recurringId)
    }
    setDeleteModal({ isOpen: false, recurringId: null })
  }

  const getRecurringToDelete = () => {
    if (!deleteModal.recurringId) return null
    return recurringTransactions.find((r) => r.id === deleteModal.recurringId)
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Categoria não encontrada"
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#64748b"
  }

  const filteredCategories = categories.filter((cat) => cat.type === formData.type || cat.type === "both")

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* Header with Process Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações Recorrentes</h1>
          <p className="text-gray-600 mt-2">Gerencie receitas e despesas que se repetem mensalmente</p>
        </div>
        <Button
          onClick={onProcessRecurring}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Processar Recorrentes
        </Button>
      </div>

      {/* Add Recurring Form */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Gerenciar Transações Recorrentes
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Recorrente
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t bg-slate-50/50">
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              {/* Transaction Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Tipo de Transação</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") =>
                    setFormData((prev) => ({ ...prev, type: value, category: "" }))
                  }
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="text-emerald-700 font-medium">
                      Receita
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="text-red-700 font-medium">
                      Despesa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="recurringName">Nome da Transação</Label>
                  <Input
                    id="recurringName"
                    placeholder="Ex: Salário, Aluguel, Internet"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Valor
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                {/* Day of Month */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Dia do Mês
                  </Label>
                  <Select
                    value={formData.dayOfMonth}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, dayOfMonth: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOptions.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Dia {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingRecurring ? "Salvar Alterações" : "Adicionar Recorrente"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingRecurring(null)
                    setFormData({
                      name: "",
                      amount: "",
                      dayOfMonth: "",
                      type: "expense",
                      category: "",
                    })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Recurring Transactions List */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-slate-800">Transações Recorrentes ({recurringTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {recurringTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Nenhuma transação recorrente encontrada</p>
              <p className="text-slate-400 text-sm mt-2">
                Adicione transações que se repetem mensalmente para automatizar seu controle financeiro
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recurringTransactions.map((recurring) => (
                <div
                  key={recurring.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(recurring.category) }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-slate-900">{recurring.name}</h4>
                        <Badge
                          variant={recurring.type === "income" ? "default" : "secondary"}
                          className={
                            recurring.type === "income" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {recurring.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>{getCategoryName(recurring.category)}</span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Todo dia {recurring.dayOfMonth}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          recurring.type === "income" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {recurring.type === "income" ? "+" : "-"}R${" "}
                        {recurring.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRecurring(recurring)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(recurring.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, recurringId: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Transação Recorrente"
        message={
          getRecurringToDelete()
            ? `Tem certeza que deseja excluir a transação recorrente "${getRecurringToDelete()?.name}"? Esta ação não pode ser desfeita e a transação não será mais adicionada automaticamente.`
            : "Tem certeza que deseja excluir esta transação recorrente?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}
