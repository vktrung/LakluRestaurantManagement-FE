export interface Voucher {
    id: number
    code: string
    discountType: "PERCENTAGE" | "FIXEDAMOUNT"
    discountValue: number
    validFrom: string
    validUntil: string
    status: "ACTIVE" | "INACTIVE"
    createdAt: string
    updatedAt: string
  }

export interface VoucherRequest {
  code: string
  discountType: "PERCENTAGE" | "FIXEDAMOUNT"
  discountValue: number
  validFrom: string
  validUntil: string
  status: "ACTIVE" | "INACTIVE"
}