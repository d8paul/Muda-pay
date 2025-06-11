"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"
import { post, put, get } from "@/utils/api"

export interface CustomFeeFormData {
  fee_name: string
  product_id: string
  fee_type: "percentage" | "flat"
  percentage_value: number
  minimum_amount: string
  maximum_amount: string
  active_status: boolean
}

export interface Product {
  product_id: number
  product_name: string
  product_code: string
  transaction_type: string
  status: string
  currency: string
  fee_type: string
  fee_amount: number
  created_at: string
}

interface CustomFeeFormProps {
  clientId: string
  products: Product[]
  isEditing: boolean
  editingFeeId: number | null
  formData: CustomFeeFormData
  onFormChange: (field: keyof CustomFeeFormData, value: string | boolean | number) => void
  onCancel: () => void
  onRefreshFees: () => void
}

export default function CustomFeeForm({
  clientId,
  products,
  isEditing,
  editingFeeId,
  formData,
  onFormChange,
  onCancel,
  onRefreshFees
}: CustomFeeFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleProductSelect = (productId: string) => {
    // Don't process the disabled "no-products" option
    if (productId === "no-products") return
    
    const selectedProduct = products.find(p => p.product_id.toString() === productId)
    
    if (selectedProduct) {
      // Auto-fill the fee name based on the product
      const autoFeeName = `${selectedProduct.product_name}_CUSTOM`
      
      onFormChange("product_id", productId)
      if (!formData.fee_name) {
        onFormChange("fee_name", autoFeeName)
      }
    } else {
      onFormChange("product_id", productId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clientId) return

    setIsLoading(true)
    try {
      const payload = formData

      if (isEditing && editingFeeId) {
        await put(`/admin/business/${clientId}/fees/${editingFeeId}`, payload)
        toast.success("Custom fee updated successfully")
      } else {
        await post(`/admin/business/${clientId}/fees`, payload)
        toast.success("Custom fee created successfully")
      }

      // Refresh fees list
      onRefreshFees()
      
      // Cancel form
      onCancel()
    } catch (error) {
      console.error("Error saving custom fee:", error)
      toast.error(isEditing ? "Failed to update custom fee" : "Failed to create custom fee")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Custom Fee" : "Create Custom Fee"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee_name">Fee Name</Label>
              <Input
                id="fee_name"
                value={formData.fee_name}
                onChange={(e) => onFormChange("fee_name", e.target.value)}
                placeholder="Enter fee name (e.g., STELLAR)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_id">Product</Label>
              <Select
                value={formData.product_id}
                onValueChange={handleProductSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="no-products" disabled>
                      {"No products available"}
                    </SelectItem>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product.product_id} value={product.product_id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.product_name}</span>
                          <span className="text-xs text-gray-500">
                            ID: {product.product_id} | Code: {product.product_code} | Type: {product.transaction_type}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee_type">Fee Type</Label>
              <Select
                value={formData.fee_type}
                onValueChange={(value) => onFormChange("fee_type", value as "percentage" | "flat")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage_value">
                {formData.fee_type === "percentage" ? "Percentage Value" : "Fee Amount"}
              </Label>
              <Input
                id="percentage_value"
                type="number"
                step="0.01"
                value={formData.percentage_value}
                onChange={(e) => onFormChange("percentage_value", parseFloat(e.target.value) || 0)}
                placeholder={formData.fee_type === "percentage" ? "Enter percentage (e.g., 2.0)" : "Enter amount"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_amount">Minimum Amount</Label>
              <Input
                id="minimum_amount"
                value={formData.minimum_amount}
                onChange={(e) => onFormChange("minimum_amount", e.target.value)}
                placeholder="Enter minimum amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximum_amount">Maximum Amount</Label>
              <Input
                id="maximum_amount"
                value={formData.maximum_amount}
                onChange={(e) => onFormChange("maximum_amount", e.target.value)}
                placeholder="Enter maximum amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.active_status}
                  onCheckedChange={(checked) => onFormChange("active_status", checked)}
                />
                <span className="text-sm text-gray-500">
                  {formData.active_status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Custom Fee" : "Create Custom Fee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
