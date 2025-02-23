"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Edit, Trash2 } from "lucide-react"
import type { FoodItem } from "../_type"

interface FoodItemProps {
  food: FoodItem
  onEdit: () => void
  onDelete: () => void
}

export default function FoodItem({ food, onEdit, onDelete }: FoodItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={food.image || "/placeholder.svg"}
          alt={food.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 ease-in-out"
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{food.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{food.category}</p>
        <p className="text-2xl font-bold text-primary">
          {food.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
        </p>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm transition-transform duration-300 ${
          isHovered ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" /> Sửa
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Xóa
          </Button>
        </div>
      </div>
    </div>
  )
}

