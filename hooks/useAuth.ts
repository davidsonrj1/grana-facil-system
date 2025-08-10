"use client"

import { useState, useEffect } from "react"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { batchOperations, transactionOperations, categoryOperations, goalOperations, recurringOperations } from "@/lib/firestore"

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)

      // Initialize default categories for new users
      if (user) {
        try {
          await batchOperations.initializeDefaultCategories(user.uid)
        } catch (error) {
          console.error("Error initializing user data:", error)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // NOVA FUNÇÃO: Atualizar nome de usuário
  const updateUserName = async (newName: string) => {
    if (user) {
      try {
        await updateProfile(user, {
          displayName: newName,
        })
        setUser({ ...user, displayName: newName })
        console.log("Nome de usuário atualizado com sucesso!")
      } catch (error) {
        console.error("Erro ao atualizar o nome de usuário:", error)
      }
    }
  }

  // NOVA FUNÇÃO: Deletar conta com todos os dados
  const deleteUserAccount = async () => {
    if (user) {
      try {
        // Deletar todas as transações, categorias, metas e recorrentes do usuário
        // Esta é uma implementação simplificada. Em um ambiente de produção, seria ideal
        // ter uma função de servidor (Cloud Function) para fazer isso de forma mais segura.
        console.log("Deletando dados do usuário...");
        
        // Exclusão de transações
        const transactionsToDelete = await transactionOperations.getByUser(user.uid);
        await Promise.all(transactionsToDelete.map(t => transactionOperations.delete(t.id)));

        // Exclusão de categorias
        const categoriesToDelete = await categoryOperations.getByUser(user.uid);
        await Promise.all(categoriesToDelete.map(c => categoryOperations.delete(c.id)));

        // Exclusão de metas
        const goalsToDelete = await goalOperations.getByUser(user.uid);
        await Promise.all(goalsToDelete.map(g => goalOperations.delete(g.id)));

        // Exclusão de recorrentes
        const recurringToDelete = await recurringOperations.getByUser(user.uid);
        await Promise.all(recurringToDelete.map(r => recurringOperations.delete(r.id)));

        // Excluir o documento de inicialização para permitir uma nova configuração no futuro
        // Lógica de exclusão do documento do usuário
        
        // Deletar o usuário do Firebase Auth
        await user.delete();

        console.log("Conta e dados deletados com sucesso. Redirecionando...");
        await signOut();
      } catch (error) {
        console.error("Erro ao deletar a conta do usuário:", error);
        alert("Ocorreu um erro ao tentar deletar sua conta. Por favor, tente novamente.");
      }
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    updateUserName,
    deleteUserAccount,
  }
}