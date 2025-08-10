import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  getDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Transaction, Category, Goal, RecurringTransaction } from "@/app/page"

// Collections
const COLLECTIONS = {
  TRANSACTIONS: "transactions",
  CATEGORIES: "categories",
  GOALS: "goals",
  RECURRING: "recurring",
  USERS: "users",
} as const

// Firestore data types
export interface FirestoreTransaction extends Omit<Transaction, "id" | "date"> {
  date: Timestamp
  userId: string
}

export interface FirestoreCategory extends Omit<Category, "id"> {
  userId: string
}

export interface FirestoreGoal extends Omit<Goal, "id" | "deadline"> {
  deadline?: Timestamp
  userId: string
}

export interface FirestoreRecurringTransaction extends Omit<RecurringTransaction, "id"> {
  userId: string
}

// Helper functions to convert between Firestore and app data
const convertFirestoreTransaction = (doc: any): Transaction => ({
  id: doc.id,
  ...doc.data(),
  date: doc.data().date.toDate().toISOString().split("T")[0],
})

const convertFirestoreGoal = (doc: any): Goal => ({
  id: doc.id,
  ...doc.data(),
  deadline: doc.data().deadline?.toDate().toISOString().split("T")[0],
})

const convertFirestoreCategory = (doc: any): Category => ({
  id: doc.id,
  ...doc.data(),
})

const convertFirestoreRecurring = (doc: any): RecurringTransaction => ({
  id: doc.id,
  ...doc.data(),
})

// Transaction operations
export const transactionOperations = {
  // Add transaction
  add: async (userId: string, transaction: Omit<Transaction, "id">): Promise<string> => {
    const firestoreTransaction: Omit<FirestoreTransaction, "id"> = {
      ...transaction,
      date: Timestamp.fromDate(new Date(transaction.date)),
      userId,
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), firestoreTransaction)
    return docRef.id
  },

  // Update transaction
  update: async (id: string, transaction: Omit<Transaction, "id">): Promise<void> => {
    const firestoreTransaction = {
      ...transaction,
      date: Timestamp.fromDate(new Date(transaction.date)),
    }

    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, id), firestoreTransaction)
  },

  // Delete transaction
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id))
  },

  // Get user transactions
  getByUser: async (userId: string): Promise<Transaction[]> => {
    const q = query(collection(db, COLLECTIONS.TRANSACTIONS), where("userId", "==", userId), orderBy("date", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFirestoreTransaction)
  },

  // Subscribe to user transactions
  subscribeToUser: (userId: string, callback: (transactions: Transaction[]) => void) => {
    const q = query(collection(db, COLLECTIONS.TRANSACTIONS), where("userId", "==", userId), orderBy("date", "desc"))

    return onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(convertFirestoreTransaction)
      callback(transactions)
    })
  },
}

// Category operations
export const categoryOperations = {
  // Add category
  add: async (userId: string, category: Omit<Category, "id">): Promise<string> => {
    const firestoreCategory: Omit<FirestoreCategory, "id"> = {
      ...category,
      userId,
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), firestoreCategory)
    return docRef.id
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id))
  },

  // Get user categories
  getByUser: async (userId: string): Promise<Category[]> => {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFirestoreCategory)
  },

  // Subscribe to user categories
  subscribeToUser: (userId: string, callback: (categories: Category[]) => void) => {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), where("userId", "==", userId))

    return onSnapshot(q, (querySnapshot) => {
      const categories = querySnapshot.docs.map(convertFirestoreCategory)
      callback(categories)
    })
  },
}

// Goal operations
export const goalOperations = {
  // Add goal
  add: async (userId: string, goal: Omit<Goal, "id" | "currentAmount">): Promise<string> => {
    const firestoreGoal: Omit<FirestoreGoal, "id"> = {
      ...goal,
      currentAmount: 0,
      deadline: goal.deadline ? Timestamp.fromDate(new Date(goal.deadline)) : undefined,
      userId,
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.GOALS), firestoreGoal)
    return docRef.id
  },

  // Update goal
  update: async (id: string, goal: Omit<Goal, "id" | "currentAmount">): Promise<void> => {
    const firestoreGoal = {
      ...goal,
      deadline: goal.deadline ? Timestamp.fromDate(new Date(goal.deadline)) : undefined,
    }

    await updateDoc(doc(db, COLLECTIONS.GOALS, id), firestoreGoal)
  },

  // Update goal amount
  updateAmount: async (id: string, currentAmount: number): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.GOALS, id), { currentAmount })
  },

  // Delete goal
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.GOALS, id))
  },

  // Get user goals
  getByUser: async (userId: string): Promise<Goal[]> => {
    const q = query(collection(db, COLLECTIONS.GOALS), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFirestoreGoal)
  },

  // Subscribe to user goals
  subscribeToUser: (userId: string, callback: (goals: Goal[]) => void) => {
    const q = query(collection(db, COLLECTIONS.GOALS), where("userId", "==", userId))

    return onSnapshot(q, (querySnapshot) => {
      const goals = querySnapshot.docs.map(convertFirestoreGoal)
      callback(goals)
    })
  },
}

// Recurring transaction operations
export const recurringOperations = {
  // Add recurring transaction
  add: async (userId: string, recurring: Omit<RecurringTransaction, "id">): Promise<string> => {
    const firestoreRecurring: Omit<FirestoreRecurringTransaction, "id"> = {
      ...recurring,
      userId,
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.RECURRING), firestoreRecurring)
    return docRef.id
  },

  // Update recurring transaction
  update: async (id: string, recurring: Omit<RecurringTransaction, "id">): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.RECURRING, id), recurring)
  },

  // Delete recurring transaction
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.RECURRING, id))
  },

  // Get user recurring transactions
  getByUser: async (userId: string): Promise<RecurringTransaction[]> => {
    const q = query(collection(db, COLLECTIONS.RECURRING), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFirestoreRecurring)
  },

  // Subscribe to user recurring transactions
  subscribeToUser: (userId: string, callback: (recurring: RecurringTransaction[]) => void) => {
    const q = query(collection(db, COLLECTIONS.RECURRING), where("userId", "==", userId))

    return onSnapshot(q, (querySnapshot) => {
      const recurring = querySnapshot.docs.map(convertFirestoreRecurring)
      callback(recurring)
    })
  },
}

// Batch operations for initial data setup
export const batchOperations = {
  // Initialize default categories for new user
  initializeDefaultCategories: async (userId: string): Promise<void> => {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userDocRef);

    // Se o documento do usuário já existe e a inicialização já foi feita, saia
    if (userDoc.exists() && userDoc.data()?.initialSetupCompleted) {
      console.log("Inicialização já concluída para este usuário.");
      return;
    }
    
    const defaultCategories = [
      { name: "Educação", color: "#3b82f6", type: "expense" as const },
      { name: "Transporte", color: "#f59e0b", type: "expense" as const },
      { name: "Alimentação", color: "#f59e0b", type: "expense" as const },
      { name: "Salário", color: "#10b981", type: "income" as const },
      { name: "Freelance", color: "#06b6d4", type: "income" as const },
      { name: "Lazer", color: "#8b5cf6", type: "expense" as const },
    ]

    const batch = writeBatch(db)

    // Adicione um documento para o usuário marcando a inicialização como concluída
    batch.set(userDocRef, { initialSetupCompleted: true });

    defaultCategories.forEach((category) => {
      const docRef = doc(collection(db, COLLECTIONS.CATEGORIES))
      batch.set(docRef, { ...category, userId })
    })

    await batch.commit()
  },
}