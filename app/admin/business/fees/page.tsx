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
  CustomFeesTab,
  CustomFeeForm,
  PendingFeesTab,
  type CustomFee,
  type CustomFeeFormData,
  type PendingFee,
  type Product
} from "./components"

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
  const [customFees, setCustomFees] = useState<CustomFee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [businessName, setBusinessName] = useState("")
  const [activeTab, setActiveTab] = useState("view-custom-fees")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null)
  const [customFeeFormData, setCustomFeeFormData] = useState<CustomFeeFormData>(initialCustomFeeFormData)
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
        
        // The API returns all fees, we need to get custom fees
        const allFees = feesResponse.data || []
        
        // Filter custom fees (those with fee_name, product_id as string, etc.)
        const customFeesData = allFees.filter((fee: any) => fee.fee_name && typeof fee.product_id === 'string')
        
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
      
      // Filter and update custom fees only
      const customFeesData = allFees.filter((fee: any) => fee.fee_name && typeof fee.product_id === 'string')
      
      setCustomFees(customFeesData)
    } catch (error) {
      console.error("Error refreshing fees:", error)
      toast.error("Failed to refresh fees data")
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
              <TabsTrigger value="view-custom-fees">Custom Fees</TabsTrigger>
              <TabsTrigger value="create-custom-fee">{isEditingCustom ? "Edit Custom Fee" : "Add Custom Fee"}</TabsTrigger>
              <TabsTrigger value="pending-fees">Pending Fees</TabsTrigger>
            </TabsList>

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
              onClick={confirmDeleteCustomFee}
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