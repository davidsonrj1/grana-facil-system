"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Transaction, Category } from "@/app/page"

interface CategoryChartProps {
  transactions: Transaction[]
  categories: Category[]
  currentDate: Date
}

export default function CategoryChart({ transactions, categories, currentDate }: CategoryChartProps) {
  const expenseData = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === "expense")
    const categoryTotals = expenseTransactions.reduce(
      (acc, transaction) => {
        const category = categories.find((c) => c.id === transaction.category)
        const categoryName = category?.name || "Outros"
        const categoryColor = category?.color || "#64748b"

        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0, color: categoryColor }
        }
        acc[categoryName].value += transaction.amount
        return acc
      },
      {} as Record<string, { name: string; value: number; color: string }>,
    )

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  const incomeData = useMemo(() => {
    const incomeTransactions = transactions.filter((t) => t.type === "income")
    const categoryTotals = incomeTransactions.reduce(
      (acc, transaction) => {
        const category = categories.find((c) => c.id === transaction.category)
        const categoryName = category?.name || "Outros"
        const categoryColor = category?.color || "#64748b"

        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0, color: categoryColor }
        }
        acc[categoryName].value += transaction.amount
        return acc
      },
      {} as Record<string, { name: string; value: number; color: string }>,
    )

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  const renderChart = (data: { name: string; value: number; color: string }[]) => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <PieChart className="w-8 h-8 text-gray-400" />
            </div>
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className="font-medium text-gray-900">
                R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 mb-4">
          <TabsTrigger value="expenses" className="data-[state=active]:bg-white">
            Despesas
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-white">
            Receitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Gráfico por categoria</h3>
            <p className="text-sm text-gray-500">
              1 De{" "}
              {currentDate.toLocaleDateString("pt-BR", { month: "long" }).charAt(0).toUpperCase() +
                currentDate.toLocaleDateString("pt-BR", { month: "long" }).slice(1)}{" "}
              - {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()} De{" "}
              {currentDate.toLocaleDateString("pt-BR", { month: "long" }).charAt(0).toUpperCase() +
                currentDate.toLocaleDateString("pt-BR", { month: "long" }).slice(1)}
            </p>
          </div>
          {renderChart(expenseData)}
        </TabsContent>

        <TabsContent value="income">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Gráfico por categoria</h3>
            <p className="text-sm text-gray-500">
              1 De{" "}
              {currentDate.toLocaleDateString("pt-BR", { month: "long" }).charAt(0).toUpperCase() +
                currentDate.toLocaleDateString("pt-BR", { month: "long" }).slice(1)}{" "}
              - {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()} De{" "}
              {currentDate.toLocaleDateString("pt-BR", { month: "long" }).charAt(0).toUpperCase() +
                currentDate.toLocaleDateString("pt-BR", { month: "long" }).slice(1)}
            </p>
          </div>
          {renderChart(incomeData)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
