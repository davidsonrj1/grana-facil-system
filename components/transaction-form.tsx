"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, DollarSign, Calendar, Tag, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { Transaction, Category, Goal } from "@/app/page"

interface TransactionFormProps {
  categories: Category[]
  goals: Goal[]
  onAddTransaction?: (transaction: Omit<Transaction, "id">) => void
  onEditTransaction?: (id: string, transaction: Omit<Transaction, "id">) => void
  onClose: () => void
  editingTransaction?: Transaction | null
}

export default function TransactionForm({
  categories,
  goals,
  onAddTransaction,
  onEditTransaction,
  onClose,
  editingTransaction,
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    paid: true,
    goalId: "",
  })

  // Populate form when editing
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        description: editingTransaction.description,
        category: editingTransaction.category,
        date: editingTransaction.date,
        paid: editingTransaction.paid,
        goalId: editingTransaction.goalId || "",
      })
    }
  }, [editingTransaction])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.description || !formData.category) {
      return
    }

    // Código alterado
    const transactionData: Omit<Transaction, "id"> = {
      type: formData.type,
      amount: Number.parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      paid: formData.paid,
    };

    // Adiciona a meta apenas se houver um valor selecionado e não for "none"
    if (formData.goalId && formData.goalId !== "none") {
      (transactionData as Transaction).goalId = formData.goalId;
    }

    if (editingTransaction && onEditTransaction) {
      onEditTransaction(editingTransaction.id, transactionData);
    } else if (onAddTransaction) {
      onAddTransaction(transactionData);
    }
    // Fim do código alterado

    onClose()
  }

  const filteredCategories = categories.filter((cat) => cat.type === formData.type || cat.type === "both")
  const availableGoals = formData.type === "income" ? goals : []

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            {editingTransaction ? "Editar Transação" : "Nova Transação"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Tipo de Transação</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: "income" | "expense") =>
                  setFormData((prev) => ({ ...prev, type: value, category: "", goalId: "" }))
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

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                className="text-lg font-semibold"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva a transação..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="resize-none"
                rows={3}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoria
              </Label>
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

            {/* Goal (only for income) */}
            {availableGoals.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <Target className="w-4 h-4 inline mr-1" />
                  Meta (Opcional)
                </Label>
                <Select
                  value={formData.goalId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, goalId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Associar a uma meta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma meta</SelectItem>
                    {availableGoals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            {/* Paid Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paid"
                checked={formData.paid}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, paid: checked as boolean }))}
              />
              <Label htmlFor="paid" className="text-sm font-medium text-gray-700">
                Transação paga
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5"
            >
              {editingTransaction ? "Salvar Alterações" : "Adicionar Transação"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}