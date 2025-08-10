"use client"

import { useState, useEffect } from "react"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  reauthenticateWithPopup,
  type User,
} from "firebase/auth"
import {
  doc,
  deleteDoc,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase";
import { batchOperations, transactionOperations, categoryOperations, goalOperations, recurringOperations, COLLECTIONS } from "@/lib/firestore"

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

  const updateUserName = async (newName: string) => {
    if (user) {
      try {
        await updateProfile(user, {
          displayName: newName,
        })
        console.log("Nome de usuário atualizado com sucesso!")
      } catch (error) {
        console.error("Erro ao atualizar o nome de usuário:", error)
      }
    }
  }

  // FUNÇÃO CORRIGIDA: Deletar conta com todos os dados
  const deleteUserAccount = async () => {
    if (user) {
      try {
        // Passo 1: Reautenticar o usuário
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(user, provider);
        console.log("Reautenticação bem-sucedida.");

        // Passo 2: Deletar todos os dados no Firestore de forma sequencial e garantindo a conclusão
        console.log("Deletando dados do usuário...");
        
        // Crie arrays de IDs a serem deletados
        const transactionsToDelete = (await transactionOperations.getByUser(user.uid)).map(t => t.id);
        const categoriesToDelete = (await categoryOperations.getByUser(user.uid)).map(c => c.id);
        const goalsToDelete = (await goalOperations.getByUser(user.uid)).map(g => g.id);
        const recurringToDelete = (await recurringOperations.getByUser(user.uid)).map(r => r.id);
        const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
        
        // Exclua os dados
        await Promise.all([
          ...transactionsToDelete.map(id => transactionOperations.delete(id)),
          ...categoriesToDelete.map(id => categoryOperations.delete(id)),
          ...goalsToDelete.map(id => goalOperations.delete(id)),
          ...recurringToDelete.map(id => recurringOperations.delete(id)),
        ]);
        
        // Deletar o documento de controle do usuário por último, após todas as outras exclusões
        await deleteDoc(userDocRef);

        console.log("Dados do Firestore deletados com sucesso.");

        // Passo 3: Deletar o usuário do Firebase Auth
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