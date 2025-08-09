"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Settings,
  Eye,
  PieChart,
  LogOut,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TransactionForm from "@/components/transaction-form"
import TransactionTable from "@/components/transaction-table"
import CategoryChart from "@/components/category-chart"
import CategoryManager from "@/components/category-manager"
import GoalManager from "@/components/goal-manager"
import RecurringManager from "@/components/recurring-manager"
import DatePicker from "@/components/date-picker"
import AuthGuard from "@/components/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { transactionOperations, categoryOperations, goalOperations, recurringOperations } from "@/lib/firestore"

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  date: string
  paid: boolean
  goalId?: string
}

export interface Category {
  id: string
  name: string
  color: string
  type: "income" | "expense" | "both"
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  description?: string
}

export interface RecurringTransaction {
  id: string
  name: string
  amount: number
  dayOfMonth: number
  type: "income" | "expense"
  category: string
}

export default function FinancialControlSystem() {
  const { user, signOut } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeView, setActiveView] = useState("overview")
  const [activePeriod, setActivePeriod] = useState<"week" | "month" | "today" | "custom" | null>("month")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to real-time data when user is authenticated
  useEffect(() => {
    if (!user) return

    setLoading(true)

    // Subscribe to transactions
    const unsubscribeTransactions = transactionOperations.subscribeToUser(user.uid, (data) => {
      setTransactions(data)
    })

    // Subscribe to categories
    const unsubscribeCategories = categoryOperations.subscribeToUser(user.uid, (data) => {
      setCategories(data)
    })

    // Subscribe to goals
    const unsubscribeGoals = goalOperations.subscribeToUser(user.uid, (data) => {
      setGoals(data)
    })

    // Subscribe to recurring transactions
    const unsubscribeRecurring = recurringOperations.subscribeToUser(user.uid, (data) => {
      setRecurringTransactions(data)
      setLoading(false)
    })

    // Cleanup subscriptions
    return () => {
      unsubscribeTransactions()
      unsubscribeCategories()
      unsubscribeGoals()
      unsubscribeRecurring()
    }
  }, [user])

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return

    try {
      await transactionOperations.add(user.uid, transaction)

      // Update goal progress if transaction is associated with a goal
      if (transaction.goalId && transaction.type === "income") {
        const goal = goals.find((g) => g.id === transaction.goalId)
        if (goal) {
          await goalOperations.updateAmount(transaction.goalId, goal.currentAmount + transaction.amount)
        }
      }
    } catch (error) {
      console.error("Error adding transaction:", error)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return

    try {
      const transaction = transactions.find((t) => t.id === id)

      // Update goal progress if needed
      if (transaction?.goalId && transaction.type === "income") {
        const goal = goals.find((g) => g.id === transaction.goalId)
        if (goal) {
          await goalOperations.updateAmount(transaction.goalId, Math.max(0, goal.currentAmount - transaction.amount))
        }
      }

      await transactionOperations.delete(id)
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const addCategory = async (category: Omit<Category, "id">) => {
    if (!user) return

    try {
      await categoryOperations.add(user.uid, category)
    } catch (error) {
      console.error("Error adding category:", error)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) return

    try {
      await categoryOperations.delete(id)
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const addGoal = async (goal: Omit<Goal, "id" | "currentAmount">) => {
    if (!user) return

    try {
      await goalOperations.add(user.uid, goal)
    } catch (error) {
      console.error("Error adding goal:", error)
    }
  }

  const deleteGoal = async (id: string) => {
    if (!user) return

    try {
      await goalOperations.delete(id)
      // Note: Firestore rules should handle removing goalId from transactions
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  const editGoal = async (id: string, updatedGoal: Omit<Goal, "id" | "currentAmount">) => {
    if (!user) return

    try {
      await goalOperations.update(id, updatedGoal)
    } catch (error) {
      console.error("Error updating goal:", error)
    }
  }

  const editTransaction = async (id: string, updatedTransaction: Omit<Transaction, "id">) => {
    if (!user) return

    try {
      const oldTransaction = transactions.find((t) => t.id === id)

      // Update goal progress if needed
      if (oldTransaction?.goalId && oldTransaction.type === "income") {
        const goal = goals.find((g) => g.id === oldTransaction.goalId)
        if (goal) {
          await goalOperations.updateAmount(
            oldTransaction.goalId,
            Math.max(0, goal.currentAmount - oldTransaction.amount),
          )
        }
      }

      if (updatedTransaction.goalId && updatedTransaction.type === "income") {
        const goal = goals.find((g) => g.id === updatedTransaction.goalId)
        if (goal) {
          await goalOperations.updateAmount(updatedTransaction.goalId, goal.currentAmount + updatedTransaction.amount)
        }
      }

      await transactionOperations.update(id, updatedTransaction)
    } catch (error) {
      console.error("Error updating transaction:", error)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }

  // Recurring transactions functions
  const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, "id">) => {
    if (!user) return

    try {
      await recurringOperations.add(user.uid, recurring)
    } catch (error) {
      console.error("Error adding recurring transaction:", error)
    }
  }

  const editRecurringTransaction = async (id: string, updatedRecurring: Omit<RecurringTransaction, "id">) => {
    if (!user) return

    try {
      await recurringOperations.update(id, updatedRecurring)
    } catch (error) {
      console.error("Error updating recurring transaction:", error)
    }
  }

  const deleteRecurringTransaction = async (id: string) => {
    if (!user) return

    try {
      await recurringOperations.delete(id)
    } catch (error) {
      console.error("Error deleting recurring transaction:", error)
    }
  }

  const processRecurringTransactions = async () => {
    if (!user) return

    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    try {
      for (const recurring of recurringTransactions) {
        // Check if we should add this recurring transaction
        if (recurring.dayOfMonth <= currentDay) {
          // Check if this transaction was already added this month
          const existingTransaction = transactions.find(
            (t) =>
              t.description === `[Recorrente] ${recurring.name}` &&
              new Date(t.date).getMonth() === currentMonth &&
              new Date(t.date).getFullYear() === currentYear,
          )

          if (!existingTransaction) {
            // Add the recurring transaction
            const transactionDate = new Date(currentYear, currentMonth, recurring.dayOfMonth)
            await addTransaction({
              type: recurring.type,
              amount: recurring.amount,
              description: `[Recorrente] ${recurring.name}`,
              category: recurring.category,
              date: transactionDate.toISOString().split("T")[0],
              paid: true,
            })
          }
        }
      }
    } catch (error) {
      console.error("Error processing recurring transactions:", error)
    }
  }

  // Get current month transactions
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    )
  })

  // Get previous month transactions
  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const previousMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return (
      transactionDate.getMonth() === previousMonth.getMonth() &&
      transactionDate.getFullYear() === previousMonth.getFullYear()
    )
  })

  // Calculate financial summary
  const currentIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const currentExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = currentIncome - currentExpenses

  const previousBalance = previousMonthTransactions.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0,
  )

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const setToday = () => {
    setCurrentDate(new Date())
    setActivePeriod("today")
  }

  const setThisWeek = () => {
    const today = new Date()
    setCurrentDate(today)
    setActivePeriod("week")
  }

  const setThisMonth = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setActivePeriod("month")
  }

  const refreshData = () => {
    // Force re-render by updating the current date
    setCurrentDate(new Date(currentDate))
  }

  const clearFilters = () => {
    setCurrentDate(new Date())
    setActivePeriod("month")
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Get current and previous month names
  const currentMonthName = currentDate.toLocaleDateString("pt-BR", { month: "long" })
  const currentCapitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

  const previousMonthName = previousMonth.toLocaleDateString("pt-BR", { month: "long" })
  const previousCapitalizedMonth = previousMonthName.charAt(0).toUpperCase() + previousMonthName.slice(1)

  // Update date ranges for display
  const currentMonthStart = `1 De ${currentCapitalizedMonth.slice(0, 3)}.`
  const currentMonthEnd = `${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()} De ${currentCapitalizedMonth.slice(0, 3)}.`

  const previousMonthStart = `1 De ${previousCapitalizedMonth.slice(0, 3)}.`
  const previousMonthEnd = `${new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate()} De ${previousCapitalizedMonth.slice(0, 3)}.`

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long" })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-emerald-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">$</span>
              </div>
              <span className="font-semibold">Grana Fácil</span>
            </div>

            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setActiveView("overview")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  activeView === "overview" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Visão geral</span>
              </button>
              <button
                onClick={() => setActiveView("goals")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  activeView === "goals" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Planeje sua grana</span>
              </button>
              <button
                onClick={() => setActiveView("categories")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  activeView === "categories" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Minhas Categorias</span>
              </button>
              <button
                onClick={() => setActiveView("recurring")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  activeView === "recurring" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Recorrentes</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <img
                    src={user.photoURL || "/placeholder-user.jpg"}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm">{user.displayName}</span>
                </div>
              )}
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-white font-bold text-lg">$</span>
              </div>
              <p className="text-gray-600">Carregando seus dados...</p>
            </div>
          </div>
        ) : (
          <div className="container mx-auto p-6">
            {activeView === "overview" && (
              <>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">{capitalizedMonth}</h1>
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant={activePeriod === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={setThisWeek}
                      className={activePeriod === "week" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    >
                      Esta semana
                    </Button>
                    <Button
                      className={`${activePeriod === "month" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-600 hover:bg-gray-700"}`}
                      size="sm"
                      onClick={setThisMonth}
                    >
                      Este mês
                    </Button>
                    <Button
                      variant={activePeriod === "today" ? "default" : "outline"}
                      size="sm"
                      onClick={setToday}
                      className={activePeriod === "today" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    >
                      Hoje
                    </Button>
                    <div className="relative">
                      <Button
                        variant={activePeriod === "custom" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={activePeriod === "custom" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {currentDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </Button>
                      {showDatePicker && (
                        <DatePicker
                          currentDate={currentDate}
                          onDateSelect={(date) => {
                            setCurrentDate(date)
                            setActivePeriod("custom")
                          }}
                          onClose={() => setShowDatePicker(false)}
                        />
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar
                    </Button>
                    <Button variant="ghost" size="icon" onClick={refreshData}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Mês Anterior ({previousCapitalizedMonth})</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        R$ {Math.abs(previousBalance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {previousMonthStart} Até {previousMonthEnd}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Receitas</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        R$ {currentIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentMonthStart} - {currentMonthEnd}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Despesas</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        R$ {currentExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentMonthStart} - {currentMonthEnd}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Saldo Atual ({currentCapitalizedMonth})</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        R$ {currentBalance >= 0 ? "" : "-"}
                        {Math.abs(currentBalance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentMonthStart} Até {currentMonthEnd}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Transactions */}
                  <div className="lg:col-span-2">
                    <Card className="bg-white border border-gray-200">
                      <CardHeader className="border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">Últimas transações</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">Verifique as últimas transações</p>
                          </div>
                          <Button
                            onClick={() => setShowTransactionForm(true)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Transação
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <TransactionTable
                          transactions={currentMonthTransactions}
                          categories={categories}
                          onDeleteTransaction={deleteTransaction}
                          onEditTransaction={handleEditTransaction}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Categories Chart */}
                  <div>
                    <Card className="bg-white border border-gray-200">
                      <CardHeader className="border-b border-gray-200 pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">Categorias</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CategoryChart
                          transactions={currentMonthTransactions}
                          categories={categories}
                          currentDate={currentDate}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {activeView === "categories" && (
              <CategoryManager categories={categories} onAddCategory={addCategory} onDeleteCategory={deleteCategory} />
            )}

            {activeView === "goals" && (
              <GoalManager goals={goals} onAddGoal={addGoal} onEditGoal={editGoal} onDeleteGoal={deleteGoal} />
            )}

            {activeView === "recurring" && (
              <RecurringManager
                recurringTransactions={recurringTransactions}
                categories={categories}
                onAddRecurring={addRecurringTransaction}
                onEditRecurring={editRecurringTransaction}
                onDeleteRecurring={deleteRecurringTransaction}
                onProcessRecurring={processRecurringTransactions}
              />
            )}

            {/* Transaction Form Modal */}
            {showTransactionForm && (
              <TransactionForm
                categories={categories}
                goals={goals}
                onAddTransaction={editingTransaction ? undefined : addTransaction}
                onEditTransaction={editingTransaction ? editTransaction : undefined}
                editingTransaction={editingTransaction}
                onClose={() => {
                  setShowTransactionForm(false)
                  setEditingTransaction(null)
                }}
              />
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
