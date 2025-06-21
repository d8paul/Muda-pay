"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bank, BankFormData, currencies, countries } from "../types"

interface PaymentMethodFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingBank: Bank | null
  formData: BankFormData
  onInputChange: (field: keyof BankFormData, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}

export default function PaymentMethodForm({
  open,
  onOpenChange,
  editingBank,
  formData,
  onInputChange,
  onSubmit,
  isSubmitting
}: PaymentMethodFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingBank ? "Edit Payment Method" : "Add Payment Method"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bank_name">Bank Name *</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => onInputChange("bank_name", e.target.value)}
              placeholder="e.g. ABC Bank"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="account_name">Account Name *</Label>
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => onInputChange("account_name", e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="account_number">Account Number *</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => onInputChange("account_number", e.target.value)}
              placeholder="e.g. 1234567890"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="swift_code">SWIFT Code *</Label>
            <Input
              id="swift_code"
              value={formData.swift_code}
              onChange={(e) => onInputChange("swift_code", e.target.value)}
              placeholder="e.g. ABCDEFXX"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => onInputChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => onInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="reference_code">Reference Code *</Label>
            <Input
              id="reference_code"
              value={formData.reference_code}
              onChange={(e) => onInputChange("reference_code", e.target.value)}
              placeholder="e.g. REF123456"
              required
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingBank ? "Processing..." : "Creating...") 
                : (editingBank ? "Update" : "Create")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
