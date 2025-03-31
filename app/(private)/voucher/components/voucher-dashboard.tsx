"use client"

import { useState, useCallback } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoucherTable } from "./voucher-table"
import { VoucherFilters } from "./voucher-filters"
import { AddVoucherDialog } from "./add-voucher-dialog"
import { EditVoucherDialog } from "./edit-voucher-dialog"
import { DeleteVoucherDialog } from "./delete-voucher-dialog"
import { 
  useGetAllVouchersQuery, 
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation
} from "@/features/voucher/voucherApiSlice"
import type { Voucher, VoucherRequest } from "@/features/voucher/type"

export default function VoucherDashboard() {
  // Queries & Mutations
  const { data: vouchers = [], isLoading } = useGetAllVouchersQuery()
  const [createVoucher] = useCreateVoucherMutation()
  const [updateVoucher] = useUpdateVoucherMutation()
  const [deleteVoucher] = useDeleteVoucherMutation()

  // Local state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [searchResults, setSearchResults] = useState<Voucher[]>([])
  const [filters, setFilters] = useState({
    status: "all",
    discountType: "all",
    search: "",
  })

  // Filter vouchers based on current filters
  const displayVouchers = filters.search ? searchResults : vouchers
  const filteredVouchers = displayVouchers.filter((voucher: Voucher) => {
    const matchesStatus = filters.status === "all" || voucher.status === filters.status
    const matchesType = filters.discountType === "all" || voucher.discountType === filters.discountType
    return matchesStatus && matchesType
  })

  // Handlers
  const handleAdd = useCallback(async (data: VoucherRequest) => {
    try {
      await createVoucher(data).unwrap()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Failed to create voucher:', error)
    }
  }, [createVoucher])

  const handleEdit = useCallback((voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setIsEditDialogOpen(true)
  }, [])

  const handleUpdate = useCallback(async (id: number, data: VoucherRequest) => {
    try {
      await updateVoucher({ id, body: data }).unwrap()
      setIsEditDialogOpen(false)
      setSelectedVoucher(null)
    } catch (error) {
      console.error('Failed to update voucher:', error)
    }
  }, [updateVoucher])

  const handleDelete = useCallback((voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async (id: number) => {
    try {
      await deleteVoucher(id).unwrap()
      setIsDeleteDialogOpen(false)
      setSelectedVoucher(null)
    } catch (error) {
      console.error('Failed to delete voucher:', error)
    }
  }, [deleteVoucher])

  const handleSearchResult = useCallback((results: Voucher[]) => {
    setSearchResults(results || [])
  }, [])

  const handleCloseDialogs = useCallback(() => {
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setSelectedVoucher(null)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <VoucherFilters 
          filters={filters} 
          setFilters={setFilters} 
          onSearchResult={handleSearchResult}
        />
        <Button onClick={() => setIsAddDialogOpen(true)} className="sm:w-auto w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm Voucher
        </Button>
      </div>

      <VoucherTable 
        vouchers={filteredVouchers} 
        isLoading={isLoading} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      {isAddDialogOpen && (
        <AddVoucherDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
          onAdd={handleAdd} 
        />
      )}

      {isEditDialogOpen && selectedVoucher && (
        <EditVoucherDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          voucher={selectedVoucher}
          onUpdate={(data) => handleUpdate(selectedVoucher.id, data)}
        />
      )}

      {isDeleteDialogOpen && selectedVoucher && (
        <DeleteVoucherDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          voucher={selectedVoucher}
          onDelete={() => handleConfirmDelete(selectedVoucher.id)}
        />
      )}
    </div>
  )
}
