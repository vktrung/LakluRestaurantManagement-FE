"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PermissionSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function PermissionSearch({ searchTerm, onSearchChange }: PermissionSearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Tìm kiếm quyền..."
        className="pl-8 h-9"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}

