"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProgressBar from "@/components/ProgressBar"
import { get, post, del, put } from "@/utils/api"
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { ChevronLeft } from "lucide-react"
import toast from "react-hot-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// Import components
import {
  ProductFeesTab,
  CustomFeesTab,
  CustomFeeForm,
  PendingFeesTab,
  type CompanyFee,
  type CustomFee,
  type CustomFeeFormData,
  type PendingFee,
  type Product
} from "./components"

interface FeeFormData {
  product_name: string
  product_code: string
  transaction_type: "PUSH" | "PULL"
  currency: "UGX" | "USD" | "EUR"
  fee_type: "FLAT" | "PERCENTAGE"
  fee_amount: number
  status: "active" | "inactive"
}

const initialFormData: FeeFormData = {
  product_name: "",
  product_code: "",
  transaction_type: "PUSH",
  currency: "UGX",
  fee_type: "FLAT",
  fee_amount: 0,
  status: "active"
}

const initialCustomFeeFormData: CustomFeeFormData = {
  fee_name: "",
  product_id: "",
  fee_type: "percentage",
  percentage_value: 0,
  minimum_amount: "",
  maximum_amount: "",
  active_status: true
}

export default function BusinessFeesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clientId = searchParams.get("client_id")
  const [isLoading, setIsLoading] = useState(true)
  const [fees, setFees] = useState<CompanyFee[]>([])
  const [customFees, setCustomFees] = useState<CustomFee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [businessName, setBusinessName] = useState("")
  const [activeTab, setActiveTab] = useState("view-fees")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState<FeeFormData>(initialFormData)
  const [customFeeFormData, setCustomFeeFormData] = useState<CustomFeeFormData>(initialCustomFeeFormData)
  const [isEditing, setIsEditing] = useState(false)
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null)
  const [isEditingCustom, setIsEditingCustom] = useState(false)
  const [editingCustomFeeId, setEditingCustomFeeId] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return

      setIsLoading(true)
      try {
        const [businessResponse, feesResponse, productsResponse] = await Promise.all([
          get(`/admin/clients/${clientId}`),
          get(`/admin/business/${clientId}/fees`),
          get('/admin/fees/products')
        ])

        setBusinessName(businessResponse.data.business_name)
        
        // The API returns all fees, we need to separate product fees from custom fees
        const allFees = feesResponse.data || []
        
        // Filter product fees (those with product_name, product_code, etc.)
        const productFees = allFees.filter((fee: any) => fee.product_name && fee.product_code)
        
        // Filter custom fees (those with fee_name, product_id as string, etc.)
        const customFeesData = allFees.filter((fee: any) => fee.fee_name && typeof fee.product_id === 'string')
        
        setFees(productFees)
        setCustomFees(customFeesData)
        
        // Set available products for dropdown
        if (productsResponse.status === 200) {
          setProducts(productsResponse.data || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to fetch fees data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [clientId])

  // Refresh fees data
  const refreshFeesData = async () => {
    if (!clientId) return

    try {
      const feesResponse = await get(`/admin/business/${clientId}/fees`)
      const allFees = feesResponse.data || []
      
      // Filter and update both product and custom fees
      const productFees = allFees.filter((fee: any) => fee.product_name && fee.product_code)
      const customFeesData = allFees.filter((fee: any) => fee.fee_name && typeof fee.product_id === 'string')
      
      setFees(productFees)
      setCustomFees(customFeesData)
    } catch (error) {
      console.error("Error refreshing fees:", error)
      toast.error("Failed to refresh fees data")
    }
  }

  const handleDeleteClick = (productId: number) => {
    setFeeToDelete(productId.toString())
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!feeToDelete || !clientId) return

    setIsLoading(true)
    try {
      await del(`/admin/business/${clientId}/fees/${feeToDelete}`)
      setFees(fees.filter(fee => fee.product_id.toString() !== feeToDelete))
      toast.success("Fee deleted successfully")
    } catch (error) {
      console.error("Error deleting fee:", error)
      toast.error("Failed to delete fee")
    } finally {
      setIsLoading(false)
      setFeeToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleEditClick = (fee: CompanyFee) => {
    setFormData({
      product_name: fee.product_name,
      product_code: fee.product_code,
      transaction_type: fee.transaction_type,
      currency: fee.currency,
      fee_type: fee.fee_type,
      fee_amount: fee.fee_amount,
      status: fee.status
    })
    setEditingFeeId(fee.product_id.toString())
    setIsEditing(true)
    setActiveTab("create-fee")
  }

  const handleFormChange = (field: keyof FeeFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setIsEditing(false)
    setEditingFeeId(null)
  }

  const handleSubmit = async () => {
    if (!clientId) return

    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        client_id: clientId
      }

      if (isEditing && editingFeeId) {
        await put(`/admin/business/${clientId}/fees/${editingFeeId}`, payload)
        toast.success("Fee updated successfully")
      } else {
        await post(`/admin/business/${clientId}/fees`, payload)
        toast.success("Fee created successfully")
      }

      // Refresh fees list
      const feesResponse = await get(`/admin/business/${clientId}/fees`)
      setFees(feesResponse.data || [])
      
      // Reset form and switch to view tab
      resetForm()
      setActiveTab("view-fees")
    } catch (error) {
      console.error("Error saving fee:", error)
      toast.error(isEditing ? "Failed to update fee" : "Failed to create fee")
    } finally {
      setIsLoading(false)
    }
  }

  // Custom fee handlers
  const handleDeleteCustomFeeClick = (feeId: number) => {
    setFeeToDelete(feeId.toString())
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCustomFee = async () => {
    if (!feeToDelete || !clientId) return

    setIsLoading(true)
    try {
      await del(`/admin/business/${clientId}/fees/${feeToDelete}`)
      
      // Refresh fees list
      await refreshFeesData()
      
      toast.success("Custom fee deleted successfully")
    } catch (error) {
      console.error("Error deleting custom fee:", error)
      toast.error("Failed to delete custom fee")
    } finally {
      setIsLoading(false)
      setFeeToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleEditCustomFeeClick = (fee: CustomFee) => {
    setCustomFeeFormData({
      fee_name: fee.fee_name,
      product_id: fee.product_id,
      fee_type: fee.fee_type,
      percentage_value: fee.percentage_value,
      minimum_amount: fee.minimum_amount,
      maximum_amount: fee.maximum_amount,
      active_status: fee.active_status
    })
    setEditingCustomFeeId(fee.id)
    setIsEditingCustom(true)
    setActiveTab("create-custom-fee")
  }

  const handleCustomFeeFormChange = (field: keyof CustomFeeFormData, value: string | boolean | number) => {
    setCustomFeeFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetCustomFeeForm = () => {
    setCustomFeeFormData(initialCustomFeeFormData)
    setIsEditingCustom(false)
    setEditingCustomFeeId(null)
  }

  if (!clientId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Invalid Client ID</h1>
      </div>
    )
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push("/admin/business/businesslist")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Businesses
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Fees for {businessName}
              </h1>
              <p className="text-gray-500 mt-1">Manage product fees and custom business fees</p>
            </div>
            {/* <Button onClick={() => {
              resetForm()
              setActiveTab("create-fee")
            }}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Fee
            </Button> */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="view-fees">Product Fees</TabsTrigger>
              <TabsTrigger value="view-custom-fees">Custom Fees</TabsTrigger>
              <TabsTrigger value="create-fee">{isEditing ? "Edit Product Fee" : null}</TabsTrigger>
              <TabsTrigger value="create-custom-fee">{isEditingCustom ? "Edit Custom Fee" : "Add Custom Fee"}</TabsTrigger>
              <TabsTrigger value="pending-fees">Pending Fees</TabsTrigger>
            </TabsList>

            <TabsContent value="view-fees">
              <ProductFeesTab
                fees={fees}
                isLoading={isLoading}
                onEditFee={handleEditClick}
                onDeleteFee={handleDeleteClick}
              />
            </TabsContent>

            <TabsContent value="view-custom-fees">
              <CustomFeesTab
                clientId={clientId}
                customFees={customFees}
                products={products}
                isLoading={isLoading}
                onEditCustomFee={handleEditCustomFeeClick}
                onDeleteCustomFee={handleDeleteCustomFeeClick}
                onRefreshFees={refreshFeesData}
                onSwitchToAddTab={() => {
                  resetCustomFeeForm()
                  setActiveTab("create-custom-fee")
                }}
              />
            </TabsContent>

            <TabsContent value="create-fee">
              <Card>
                <CardHeader>
                  <CardTitle>{isEditing ? "Edit Company Fee" : "Create Company Fee"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product_name">Product Name</Label>
                        <Input
                          id="product_name"
                          value={formData.product_name}
                          onChange={(e) => handleFormChange("product_name", e.target.value)}
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="product_code">Product Code</Label>
                        <Input
                          id="product_code"
                          value={formData.product_code}
                          onChange={(e) => handleFormChange("product_code", e.target.value)}
                          placeholder="Enter product code"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transaction_type">Transaction Type</Label>
                        <Select
                          value={formData.transaction_type}
                          onValueChange={(value) => handleFormChange("transaction_type", value as "PUSH" | "PULL")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PUSH">PUSH</SelectItem>
                            <SelectItem value="PULL">PULL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleFormChange("currency", value as "UGX" | "USD" | "EUR")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UGX">UGX</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fee_type">Fee Type</Label>
                        <Select
                          value={formData.fee_type}
                          onValueChange={(value) => handleFormChange("fee_type", value as "FLAT" | "PERCENTAGE")}
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

                      <div className="space-y-2">
                        <Label htmlFor="fee_amount">Fee Amount</Label>
                        <Input
                          id="fee_amount"
                          type="number"
                          value={formData.fee_amount}
                          onChange={(e) => handleFormChange("fee_amount", parseFloat(e.target.value) || 0)}
                          placeholder={formData.fee_type === "PERCENTAGE" ? "Enter percentage" : "Enter amount"}
                          required
                        />
                      </div>

                      <div className="space-y-2">
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
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetForm()
                          setActiveTab("view-fees")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isEditing ? "Update Fee" : "Create Fee"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create-custom-fee">
              <CustomFeeForm
                clientId={clientId}
                products={products}
                isEditing={isEditingCustom}
                editingFeeId={editingCustomFeeId}
                formData={customFeeFormData}
                onFormChange={handleCustomFeeFormChange}
                onCancel={() => {
                  resetCustomFeeForm()
                  setActiveTab("view-custom-fees")
                }}
                onRefreshFees={refreshFeesData}
              />
            </TabsContent>

            <TabsContent value="pending-fees">
              <PendingFeesTab
                businessId={clientId}
                products={products}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={activeTab === "view-custom-fees" ? confirmDeleteCustomFee : confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}