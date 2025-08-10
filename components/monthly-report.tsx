"use client"

import { useMemo, useState } from "react"
import { TrendingUp, TrendingDown, Tag, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import type { Transaction, Category } from "@/app/page"

interface MonthlyReportProps {
  transactions: Transaction[]
  categories: Category[]
  currentDate: Date
}

export default function MonthlyReport({ transactions, categories, currentDate }: MonthlyReportProps) {
  const [filterType, setFilterType] = useState<"expense" | "income" | "all">("expense");

  const monthlyTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Categoria não encontrada";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#64748b";
  };
  
  const reportData = useMemo(() => {
    const filteredTransactions = monthlyTransactions.filter(
      (t) => t.type === filterType || filterType === "all"
    );

    const categoryTotals = filteredTransactions.reduce(
      (acc, transaction) => {
        const categoryId = transaction.category;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            id: categoryId,
            name: getCategoryName(categoryId),
            color: getCategoryColor(categoryId),
            total: 0,
          };
        }
        acc[categoryId].total += transaction.amount;
        return acc;
      },
      {} as Record<string, { id: string; name: string; color: string; total: number }>
    );

    return Object.values(categoryTotals).sort((a, b) => b.total - a.total);
  }, [monthlyTransactions, categories, filterType]);

  const totalAmount = reportData.reduce((sum, item) => sum + item.total, 0);

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Relatório Mensal</h1>
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={filterType} onValueChange={(value) => setFilterType(value as "expense" | "income" | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center">
            {filterType === "expense" ? <TrendingDown className="w-5 h-5 mr-2" /> : <TrendingUp className="w-5 h-5 mr-2" />}
            Desempenho por Categoria em {capitalizedMonth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">Nenhum dado para o período selecionado</p>
              <p className="text-slate-400 text-sm mt-2">Adicione transações para visualizar o relatório</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportData.map((item) => {
                const percentage = totalAmount > 0 ? (item.total / totalAmount) * 100 : 0;
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gray-100 text-gray-800 border-0">
                          {percentage.toFixed(1)}%
                        </Badge>
                        <span className="font-semibold text-gray-900">
                          R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}