"use client"

import { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConfirmationModal from "@/components/confirmation-modal"
import type { Transaction, Category } from "@/app/page"

interface TransactionTableProps {
  transactions: Transaction[]
  categories: Category[]
  onDeleteTransaction: (id: string) => void
  onEditTransaction: (transaction: Transaction) => void
}

export default function TransactionTable({
  transactions,
  categories,
  onDeleteTransaction,
  onEditTransaction,
}: TransactionTableProps) {
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all")
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; transactionId: string | null }>({
    isOpen: false,
    transactionId: null,
  })

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true
    return transaction.type === filter
  })

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Categoria não encontrada"
  }

  const getCategoryBadgeColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return "bg-gray-100 text-gray-800"

    switch (category.name.toLowerCase()) {
      case "educação":
        return "bg-blue-100 text-blue-800"
      case "transporte":
      case "alimentação":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteClick = (transactionId: string) => {
    setDeleteModal({ isOpen: true, transactionId })
  }

  const handleDeleteConfirm = () => {
    if (deleteModal.transactionId) {
      onDeleteTransaction(deleteModal.transactionId)
    }
    setDeleteModal({ isOpen: false, transactionId: null })
  }

  const getTransactionToDelete = () => {
    if (!deleteModal.transactionId) return null
    return transactions.find((t) => t.id === deleteModal.transactionId)
  }

  const transactionToDelete = getTransactionToDelete()

  return (
    <div>
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "expense" | "income")} className="mb-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">
            Todas
          </TabsTrigger>
          <TabsTrigger value="expense" className="data-[state=active]:bg-white">
            Despesas
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-white">
            Receitas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="mb-4 px-6">
        <input
          type="text"
          placeholder="Pesquisar receitas ou gastos"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nenhuma transação encontrada
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getCategoryBadgeColor(transaction.category)} border-0`}>
                      {getCategoryName(transaction.category)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={transaction.type === "income" ? "default" : "destructive"}
                      className={
                        transaction.type === "income"
                          ? "bg-emerald-100 text-emerald-800 border-0"
                          : "bg-red-100 text-red-800 border-0"
                      }
                    >
                      {transaction.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        transaction.paid
                          ? "bg-emerald-100 text-emerald-800 border-0"
                          : "bg-gray-100 text-gray-800 border-0"
                      }
                    >
                      {transaction.paid ? "Pago" : "Pendente"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => onEditTransaction(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() => handleDeleteClick(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, transactionId: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Transação"
        message={
          transactionToDelete
            ? `Tem certeza que deseja excluir a transação "${transactionToDelete.description}" no valor de R$ ${transactionToDelete.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir esta transação?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}
