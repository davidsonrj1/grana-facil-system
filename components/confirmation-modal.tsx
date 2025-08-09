"use client"

import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning"
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                type === "danger" ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <AlertTriangle className={`w-5 h-5 ${type === "danger" ? "text-red-600" : "text-yellow-600"}`} />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>

          <div className="flex space-x-3">
            <Button
              onClick={handleConfirm}
              className={`flex-1 font-semibold ${
                type === "danger"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }`}
            >
              {confirmText}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              {cancelText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
