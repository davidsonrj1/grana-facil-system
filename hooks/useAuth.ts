"use client"

import { useState, useEffect } from "react"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { batchOperations } from "@/lib/firestore"

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
          // Check if user already has categories by trying to get them
          // If none exist, initialize default ones
          const { categoryOperations } = await import("@/lib/firestore")
          const categories = await categoryOperations.getByUser(user.uid)

          if (categories.length === 0) {
            await batchOperations.initializeDefaultCategories(user.uid)
          }
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

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }
}
