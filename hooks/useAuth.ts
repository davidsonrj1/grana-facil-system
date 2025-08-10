// hooks/useAuth.ts

import { useState, useEffect, useRef } from "react" // Importei useRef
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { batchOperations, categoryOperations } from "@/lib/firestore" // Removi o import dinâmico

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Flag para garantir que a inicialização só aconteça uma vez.
  const isInitializing = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)

      if (user) {
        if (isInitializing.current) {
          return; // Já estamos no processo de inicialização, evite a duplicação
        }

        isInitializing.current = true; // Define a flag para true

        try {
          const categories = await categoryOperations.getByUser(user.uid);

          if (categories.length === 0) {
            console.log("Usuário novo, inicializando categorias...");
            await batchOperations.initializeDefaultCategories(user.uid);
            console.log("Categorias inicializadas com sucesso.");
          } else {
            console.log("Categorias já existem, não é necessário inicializar.");
          }
        } catch (error) {
          console.error("Error initializing user data:", error);
        } finally {
          isInitializing.current = false; // Reseta a flag
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

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }
}