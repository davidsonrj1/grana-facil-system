"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, DollarSign } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Grana Fácil</CardTitle>
            <p className="text-gray-600 mt-2">Faça login para acessar seu controle financeiro pessoal</p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={signInWithGoogle}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar com Google
            </Button>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Seus dados são seguros e privados</p>
              <p className="mt-1">Cada usuário tem acesso apenas aos seus próprios dados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
