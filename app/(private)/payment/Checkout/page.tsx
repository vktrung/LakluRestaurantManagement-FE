"use client"

import { useState } from "react"
import { Tag, Receipt, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash")
  const [vatAmount, setVatAmount] = useState("0.00")
  const [discount, setDiscount] = useState("0.00")
  const [cashReceived, setCashReceived] = useState("")

  const subtotal = 1000.0
  const vat = Number.parseFloat(vatAmount) || 0
  const discountAmount = Number.parseFloat(discount) || 0
  const total = subtotal + vat - discountAmount

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              <CardTitle>Payment</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              <span>Order ID</span>
              <div className="font-medium text-foreground">ORD-T7AHQwGH7</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Payment Method</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "cash" | "transfer")}
              className="grid grid-cols-2 gap-4"
            >
              <div className={`border rounded-md p-3 ${paymentMethod === "cash" ? "border-primary" : ""}`}>
                <RadioGroupItem value="cash" id="cash" className="sr-only" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cash" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "cash" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <rect width="18" height="12" x="3" y="6" rx="2" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M7 15h0M17 15h0M7 9h0M17 9h0" />
                  </svg>
                  Cash
                </Label>
              </div>
              <div className={`border rounded-md p-3 ${paymentMethod === "transfer" ? "border-primary" : ""}`}>
                <RadioGroupItem value="transfer" id="transfer" className="sr-only" />
                <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "transfer" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "transfer" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="m15 5-4-2-4 2" />
                    <path d="M7 10.5V16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5.5" />
                    <path d="M15 7.5V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v.5" />
                    <path d="M19 9h-14" />
                    <path d="M3 11v2" />
                    <path d="M21 11v2" />
                  </svg>
                  Transfer
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vat" className="flex items-center gap-1 mb-2 text-sm">
                <Tag className="h-4 w-4" />
                VAT Amount
              </Label>
              <Input id="vat" value={vatAmount} onChange={(e) => setVatAmount(e.target.value)} className="text-right" />
            </div>
            <div>
              <Label htmlFor="discount" className="flex items-center gap-1 mb-2 text-sm">
                <ArrowRight className="h-4 w-4" />
                Discount
              </Label>
              <Input
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="text-right"
              />
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div>
              <Label htmlFor="cashReceived" className="text-sm mb-2 block">
                Cash Received
              </Label>
              <Input
                id="cashReceived"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Enter amount received"
              />
            </div>
          )}

          <div className="space-y-2 pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT</span>
              <span>${vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button className="w-full">Complete Payment</Button>
        </CardFooter>
      </Card>
    </div>
  )
}