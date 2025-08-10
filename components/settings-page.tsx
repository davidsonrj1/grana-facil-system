"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { User, LogOut, AlertTriangle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ConfirmationModal from "@/components/confirmation-modal"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user, updateUserName, deleteUserAccount } = useAuth()
  const [newName, setNewName] = useState(user?.displayName || "")
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false) // Novo estado para o modal de carregamento

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim() !== "" && user?.displayName !== newName) {
      await updateUserName(newName)
    }
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    await deleteUserAccount()
    setIsDeleting(false) // A função de exclusão já redireciona, mas por segurança mantemos a flag.
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>

      {/* Alteração do nome de usuário */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Alterar nome de usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameChange} className="flex flex-col md:flex-row items-end gap-3">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="userName">Nome atual</Label>
              <Input
                id="userName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Salvar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Excluir conta */}
      <Card className="shadow-lg border-0 bg-red-50/80 backdrop-blur border-red-200">
        <CardHeader>
          <CardTitle className="text-rose-700 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Excluir conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rose-600 mb-4">
            Esta ação é irreversível e irá deletar permanentemente sua conta e todos os seus dados.
          </p>
          <Button
            variant="destructive"
            onClick={() => setIsConfirmationModalOpen(true)}
            className="w-full md:w-auto"
            disabled={isDeleting}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Tem certeza?"
        message="A exclusão da conta irá apagar todos os seus dados de forma permanente. Esta ação não pode ser desfeita."
        confirmText="Sim, excluir minha conta"
        cancelText="Cancelar"
        type="danger"
      />

      {/* NOVO: Modal de carregamento */}
      <Dialog open={isDeleting}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Excluindo conta...</span>
            </DialogTitle>
            <DialogDescription>
              Por favor, aguarde enquanto deletamos todos os seus dados.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}