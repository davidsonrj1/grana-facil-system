"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import type { Transaction } from "@/app/page"

interface FinancialChartProps {
  transactions: Transaction[]
  detailed?: boolean
}

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

export default function FinancialChart({ transactions, detailed = false }: FinancialChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData = transactions.reduce(
      (acc, transaction) => {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const monthName = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthName,
            income: 0,
            expenses: 0,
            balance: 0,
          }
        }

        if (transaction.type === "income") {
          acc[monthKey].income += transaction.amount
        } else {
          acc[monthKey].expenses += transaction.amount
        }

        acc[monthKey].balance = acc[monthKey].income - acc[monthKey].expenses

        return acc
      },
      {} as Record<string, { month: string; income: number; expenses: number; balance: number }>,
    )

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
  }, [transactions])

  const categoryData = useMemo(() => {
    const categoryTotals = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = 0
          }
          acc[transaction.category] += transaction.amount
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 categories
  }, [transactions])

  if (detailed) {
    return (
      <div className="space-y-8">
        {/* Monthly Overview */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Visão Mensal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "",
                  ]}
                  labelStyle={{ color: "#1e293b" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="income" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Trend */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Evolução do Saldo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Saldo",
                  ]}
                  labelStyle={{ color: "#1e293b" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Despesas por Categoria</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                      "Total",
                    ]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Simple chart for dashboard
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]}
            labelStyle={{ color: "#1e293b" }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar dataKey="income" fill="#10b981" name="Receitas" radius={[2, 2, 0, 0]} />
          <Bar dataKey="expenses" fill="#ef4444" name="Despesas" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
