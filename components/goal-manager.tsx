"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Target, Calendar, DollarSign, TrendingUp, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Goal } from "@/app/page"
import ConfirmationModal from "@/components/confirmation-modal"

interface GoalManagerProps {
  goals: Goal[]
  onAddGoal: (goal: Omit<Goal, "id" | "currentAmount">) => void
  onDeleteGoal: (id: string) => void
  onEditGoal: (id: string, goal: Omit<Goal, "id" | "currentAmount">) => void
}

export default function GoalManager({ goals, onAddGoal, onDeleteGoal, onEditGoal }: GoalManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    description: "",
  })
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; goalId: string | null }>({
    isOpen: false,
    goalId: null,
  })

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline || "",
      description: goal.description || "",
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.targetAmount) return

    if (editingGoal) {
      // Editar meta existente
      onEditGoal(editingGoal.id, {
        name: formData.name.trim(),
        targetAmount: Number.parseFloat(formData.targetAmount),
        deadline: formData.deadline || undefined,
        description: formData.description.trim() || undefined,
      })
    } else {
      // Criar nova meta
      onAddGoal({
        name: formData.name.trim(),
        targetAmount: Number.parseFloat(formData.targetAmount),
        deadline: formData.deadline || undefined,
        description: formData.description.trim() || undefined,
      })
    }

    setFormData({
      name: "",
      targetAmount: "",
      deadline: "",
      description: "",
    })
    setShowForm(false)
    setEditingGoal(null)
  }

  const getProgressStatus = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    if (progress >= 100) return { status: "completed", color: "emerald" }
    if (progress >= 75) return { status: "almost", color: "blue" }
    if (progress >= 50) return { status: "halfway", color: "yellow" }
    if (progress >= 25) return { status: "started", color: "orange" }
    return { status: "beginning", color: "slate" }
  }

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const today = new Date()
    return deadlineDate < today
  }

  const renderDescription = (description?: string) => {
    if (!description) return null

    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = description.split(urlRegex)

    return (
      <p className="text-slate-600 text-sm mb-3">
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {part}
              </a>
            )
          }
          return part
        })}
      </p>
    )
  }

  const handleDeleteClick = (goalId: string) => {
    setDeleteModal({ isOpen: true, goalId })
  }

  const handleDeleteConfirm = () => {
    if (deleteModal.goalId) {
      onDeleteGoal(deleteModal.goalId)
    }
    setDeleteModal({ isOpen: false, goalId: null })
  }

  const getGoalToDelete = () => {
    if (!deleteModal.goalId) return null
    return goals.find((g) => g.id === deleteModal.goalId)
  }

  return (
    <div className="space-y-6">
      {/* Add Goal Form */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Gerenciar Metas Financeiras
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t bg-slate-50/50">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalName">Nome da Meta</Label>
                  <Input
                    id="goalName"
                    placeholder="Ex: Viagem para Europa"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount" className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Valor Objetivo
                  </Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, targetAmount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Prazo (Opcional)
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva sua meta..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingGoal ? "Salvar Meta" : "Adicionar Meta"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Goals List */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-slate-800">Metas Ativas ({goals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Nenhuma meta encontrada</p>
              <p className="text-slate-400 text-sm mt-2">
                Defina suas primeiras metas financeiras para começar a economizar
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                const progressStatus = getProgressStatus(goal)
                const isCompleted = progress >= 100
                const nearDeadline = isDeadlineNear(goal.deadline)
                const overdue = isOverdue(goal.deadline)

                return (
                  <div
                    key={goal.id}
                    className="p-6 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{goal.name}</h3>
                          {isCompleted && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Concluída
                            </Badge>
                          )}
                          {nearDeadline && !isCompleted && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Calendar className="w-3 h-3 mr-1" />
                              Prazo próximo
                            </Badge>
                          )}
                          {overdue && !isCompleted && (
                            <Badge variant="destructive">
                              <Calendar className="w-3 h-3 mr-1" />
                              Atrasada
                            </Badge>
                          )}
                        </div>

                        {renderDescription(goal.description)}

                        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                          <span>
                            R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R${" "}
                            {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="font-semibold">{progress.toFixed(1)}%</span>
                        </div>

                        <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />

                        {goal.deadline && (
                          <p className="text-xs text-slate-500">
                            Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>

                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditGoal(goal)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 ml-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(goal.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, goalId: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Meta"
        message={
          getGoalToDelete()
            ? `Tem certeza que deseja excluir a meta "${getGoalToDelete()?.name}"? Esta ação não pode ser desfeita e todas as transações associadas a esta meta serão desvinculadas.`
            : "Tem certeza que deseja excluir esta meta?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}
