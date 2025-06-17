"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import toast from "react-hot-toast"
import { post, put } from "@/utils/api"

interface ProviderFee {
  id: string
  provider_id: string
  currency: string
  transaction_type: "PUSH" | "PULL" | "BOTH"
  fee_type: "FLAT" | "PERCENTAGE"
  fee_value: number
  minimum_amount?: number
  maximum_amount?: number
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

interface EditProviderFeeModalProps {
  open: boolean
  onClose: () => void
  providerId: string
  supportedCurrencies: string[]
  editingFee: ProviderFee | null
  isCreating: boolean
  onSuccess: (isNewFee?: boolean) => void
}

interface FeeFormData {
  currency: string
  transaction_type: "PUSH" | "PULL" | "BOTH"
  fee_type: "FLAT" | "PERCENTAGE"
  fee_value: number
  minimum_amount: number | ""
  maximum_amount: number | ""
  status: "active" | "inactive"
}

interface FeeFormErrors {
  currency?: string
  transaction_type?: string
  fee_type?: string
  fee_value?: string
  minimum_amount?: string
  maximum_amount?: string
  status?: string
}

const initialFormData: FeeFormData = {
  currency: "",
  transaction_type: "PUSH",
  fee_type: "FLAT",
  fee_value: 0,
  minimum_amount: "",
  maximum_amount: "",
  status: "active"
}

export default function EditProviderFeeModal({
  open,
  onClose,
  providerId,
  supportedCurrencies,
  editingFee,
  isCreating,
  onSuccess
}: EditProviderFeeModalProps) {
  const [formData, setFormData] = useState<FeeFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FeeFormErrors>({})

  useEffect(() => {
    if (open) {
      if (editingFee && !isCreating) {
        // Populate form with existing fee data
        setFormData({
          currency: editingFee.currency,
          transaction_type: editingFee.transaction_type,
          fee_type: editingFee.fee_type,
          fee_value: editingFee.fee_value,
          minimum_amount: editingFee.minimum_amount || "",
          maximum_amount: editingFee.maximum_amount || "",
          status: editingFee.status
        })
      } else {
        // Reset form for new fee
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, editingFee, isCreating])

  const handleFormChange = (field: keyof FeeFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FeeFormErrors = {}

    if (!formData.currency) {
      newErrors.currency = "Currency is required"
    }

    if (formData.fee_value <= 0) {
      newErrors.fee_value = "Fee value must be greater than 0"
    }

    if (formData.fee_type === "PERCENTAGE" && formData.fee_value > 100) {
      newErrors.fee_value = "Percentage cannot be greater than 100"
    }

    if (formData.minimum_amount !== "" && formData.maximum_amount !== "" && 
        Number(formData.minimum_amount) >= Number(formData.maximum_amount)) {
      newErrors.maximum_amount = "Maximum amount must be greater than minimum amount"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        provider_id: providerId,
        minimum_amount: formData.minimum_amount === "" ? undefined : Number(formData.minimum_amount),
        maximum_amount: formData.maximum_amount === "" ? undefined : Number(formData.maximum_amount),
        fee_value: Number(formData.fee_value)
      }

      let response
      if (isCreating) {
        response = await post(`/admin/providers/${providerId}/fees`, payload)
        toast.success("Provider fee created and submitted for approval")
      } else if (editingFee) {
        response = await put(`/admin/providers/${providerId}/fees/${editingFee.id}`, payload)
        toast.success("Provider fee updated and submitted for approval")
      }

      if (response?.status === 200 || response?.status === 201) {
        onSuccess(isCreating)
      } else {
        throw new Error(response?.message || "Failed to save provider fee")
      }
    } catch (error) {
      console.error("Error saving provider fee:", error)
      toast.error(isCreating ? "Failed to create provider fee" : "Failed to update provider fee")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Create Provider Fee" : "Edit Provider Fee"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleFormChange("currency", value)}
                    disabled={!isCreating} // Currency shouldn't be changed when editing
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.length === 0 ? (
                        <SelectItem value="no-currencies" disabled>
                          No currencies available
                        </SelectItem>
                      ) : (
                        supportedCurrencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-red-500">{errors.currency}</p>
                  )}
                </div>

                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label htmlFor="transaction_type">Transaction Type *</Label>
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(value: "PUSH" | "PULL" | "BOTH") => handleFormChange("transaction_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUSH">PUSH (Send Money)</SelectItem>
                      <SelectItem value="PULL">PULL (Receive Money)</SelectItem>
                      <SelectItem value="BOTH">BOTH (Send & Receive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fee Type */}
                <div className="space-y-2">
                  <Label htmlFor="fee_type">Fee Type *</Label>
                  <Select
                    value={formData.fee_type}
                    onValueChange={(value: "FLAT" | "PERCENTAGE") => handleFormChange("fee_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FLAT">Flat Amount</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fee Value */}
                <div className="space-y-2">
                  <Label htmlFor="fee_value">
                    Fee Value * {formData.fee_type === "PERCENTAGE" ? "(%)" : `(${formData.currency || "Amount"})`}
                  </Label>
                  <Input
                    id="fee_value"
                    type="number"
                    min="0"
                    step={formData.fee_type === "PERCENTAGE" ? "0.01" : "0.01"}
                    value={formData.fee_value}
                    onChange={(e) => handleFormChange("fee_value", parseFloat(e.target.value) || 0)}
                    placeholder={formData.fee_type === "PERCENTAGE" ? "Enter percentage" : "Enter amount"}
                    required
                  />
                  {errors.fee_value && (
                    <p className="text-sm text-red-500">{errors.fee_value}</p>
                  )}
                </div>

                {/* Minimum Amount */}
                <div className="space-y-2">
                  <Label htmlFor="minimum_amount">
                    Minimum Amount {formData.currency && `(${formData.currency})`}
                  </Label>
                  <Input
                    id="minimum_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimum_amount}
                    onChange={(e) => handleFormChange("minimum_amount", e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="Enter minimum amount (optional)"
                  />
                </div>

                {/* Maximum Amount */}
                <div className="space-y-2">
                  <Label htmlFor="maximum_amount">
                    Maximum Amount {formData.currency && `(${formData.currency})`}
                  </Label>
                  <Input
                    id="maximum_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maximum_amount}
                    onChange={(e) => handleFormChange("maximum_amount", e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="Enter maximum amount (optional)"
                  />
                  {errors.maximum_amount && (
                    <p className="text-sm text-red-500">{errors.maximum_amount}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2 mt-6">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) => handleFormChange("status", checked ? "active" : "inactive")}
                  />
                  <span className="text-sm text-gray-500">
                    {formData.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Information Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> {isCreating ? "Creating" : "Updating"} this fee will submit it for approval. 
                  The changes will not take effect until approved by an authorized checker.
                </p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading 
                ? (isCreating ? "Creating..." : "Updating...") 
                : (isCreating ? "Create Fee" : "Update Fee")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
