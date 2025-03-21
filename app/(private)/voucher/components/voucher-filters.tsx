"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchVoucherByCodeQuery, useSearchVoucherByStatusQuery } from "@/features/voucher/voucherApiSlice"
import { useDebounce } from "@/hooks/use-debounce"
import type { Voucher } from "@/features/voucher/type"

interface VoucherFiltersProps {
  filters: {
    status: string
    discountType: string
    search: string
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: string
      discountType: string
      search: string
    }>
  >
  onSearchResult?: (data: Voucher[]) => void
}

export function VoucherFilters({ filters, setFilters, onSearchResult }: VoucherFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search)
  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data: searchResults, isFetching: isSearching } = useSearchVoucherByCodeQuery(debouncedSearch, {
    skip: !debouncedSearch,
  })

  const { data: statusResults, isFetching: isStatusSearching } = useSearchVoucherByStatusQuery(filters.status, {
    skip: filters.status === "all",
  })

  useEffect(() => {
    if (!debouncedSearch && filters.status === "all") {
      onSearchResult?.([])
      return
    }

    if (debouncedSearch && searchResults) {
      onSearchResult?.(searchResults)
    } else if (filters.status !== "all" && statusResults) {
      onSearchResult?.(statusResults)
    }
  }, [debouncedSearch, searchResults, filters.status, statusResults, onSearchResult])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
    if (value === "all") {
      setSearchTerm("")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative w-full sm:w-[300px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm voucher..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select 
          value={filters.status} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.discountType} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, discountType: value }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Loại giảm giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
            <SelectItem value="FIXEDAMOUNT">Số tiền cố định</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

