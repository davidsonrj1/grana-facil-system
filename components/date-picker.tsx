"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  currentDate: Date
  onDateSelect: (date: Date) => void
  onClose: () => void
}

export default function DatePicker({ currentDate, onDateSelect, onClose }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(new Date(currentDate))

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
  const today = new Date()

  const navigateMonth = (direction: "prev" | "next") => {
    setViewDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const selectDate = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onDateSelect(selectedDate)
    onClose()
  }

  const monthName = viewDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const days = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()

    const isSelected =
      day === currentDate.getDate() &&
      viewDate.getMonth() === currentDate.getMonth() &&
      viewDate.getFullYear() === currentDate.getFullYear()

    days.push(
      <button
        key={day}
        onClick={() => selectDate(day)}
        className={`w-8 h-8 text-sm rounded-full hover:bg-emerald-100 transition-colors ${
          isSelected
            ? "bg-emerald-600 text-white"
            : isToday
              ? "bg-emerald-100 text-emerald-800 font-semibold"
              : "text-gray-700 hover:text-emerald-800"
        }`}
      >
        {day}
      </button>,
    )
  }

  return (
    <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-gray-900">{capitalizedMonth}</h3>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="w-8 h-8 text-xs font-medium text-gray-500 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onDateSelect(new Date())
            onClose()
          }}
          className="w-full"
        >
          Hoje
        </Button>
      </div>
    </div>
  )
}
