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

interface CompanyFee {
  id: string
  client_id: string
  label: string
  fee_name: string
  fee_type: "percentage" | "flat"
  currency_type: "UGX" | "USD" | "EUR"
  percentage_value: number
  minimum_amount: number
  maximum_amount: number
  applicable_to: "withdrawals" | "deposits" | "all"
  active_status: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface FeeFormData {
  label: string
  fee_name: string
  currency_type: "UGX" | "USD" | "EUR"
  fee_type: "percentage" | "flat"
  percentage_value: number
  minimum_amount: number
  maximum_amount: number
  applicable_to: "withdrawals" | "deposits" | "all"
  active_status: number
}

const initialFormData: FeeFormData = {
  label: "",
  fee_name: "",
  currency_type: "UGX",
  fee_type: "percentage",
  percentage_value: 0,
  minimum_amount: 0,
  maximum_amount: 0,
  applicable_to: "withdrawals",
  active_status: 1
}

export default function BusinessFeesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clientId = searchParams.get("client_id")
  const [isLoading, setIsLoading] = useState(true)
  const [fees, setFees] = useState<CompanyFee[]>([])
  const [businessName, setBusinessName] = useState("")
  const [activeTab, setActiveTab] = useState("view-fees")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState<FeeFormData>(initialFormData)
  const [isEditing, setIsEditing] = useState(false)
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return

      setIsLoading(true)
      try {
        const [feesResponse, businessResponse] = await Promise.all([
          get(`/admin/business/${clientId}/fees`),
          get(`/admin/clients/${clientId}`)
        ])

        setFees(feesResponse.data || [])
        setBusinessName(businessResponse.data.business_name)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to fetch fees data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [clientId])

  const handleDeleteClick = (id: string) => {
    setFeeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!feeToDelete || !clientId) return

    setIsLoading(true)
    try {
      await del(`/admin/business/${clientId}/fees/${feeToDelete}`)
      setFees(fees.filter(fee => fee.id !== feeToDelete))
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
      label: fee.label,
      fee_name: fee.fee_name,
      currency_type: fee.currency_type,
      fee_type: fee.fee_type,
      percentage_value: fee.percentage_value,
      minimum_amount: fee.minimum_amount,
      maximum_amount: fee.maximum_amount,
      applicable_to: fee.applicable_to,
      active_status: fee.active_status
    })
    setEditingFeeId(fee.id)
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

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
              <p className="text-gray-500 mt-1">Manage company transaction fees</p>
            </div>
            <Button onClick={() => {
              resetForm()
              setActiveTab("create-fee")
            }}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="view-fees">View Fees</TabsTrigger>
              <TabsTrigger value="create-fee">{isEditing ? "Edit Fee" : "Create Fee"}</TabsTrigger>
            </TabsList>

            <TabsContent value="view-fees">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Fee Label</TableHead>
                      <TableHead>Fee Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Min Amount</TableHead>
                      <TableHead>Max Amount</TableHead>
                      <TableHead>Applicable To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10">
                          {isLoading ? (
                            <p className="text-muted-foreground">Loading fees...</p>
                          ) : (
                            <p className="text-muted-foreground">No transaction fees found</p>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      fees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{fee.label}</TableCell>
                          <TableCell>{fee.fee_name}</TableCell>
                          <TableCell className="capitalize">{fee.fee_type}</TableCell>
                          <TableCell>
                            {fee.fee_type === "percentage"
                              ? `${fee.percentage_value}%`
                              : `${fee.currency_type} ${formatCurrency(fee.percentage_value)}`}
                          </TableCell>
                          <TableCell>{fee.currency_type} {formatCurrency(fee.minimum_amount)}</TableCell>
                          <TableCell>
                            {fee.maximum_amount
                              ? `${fee.currency_type} ${formatCurrency(fee.maximum_amount)}`
                              : "No limit"}
                          </TableCell>
                          <TableCell className="capitalize">{fee.applicable_to}</TableCell>
                          <TableCell>
                            <Badge
                              variant={fee.active_status === 1 ? "default" : "secondary"}
                              className={
                                fee.active_status === 1
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }
                            >
                              {fee.active_status === 1 ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(fee.updated_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(fee)}
                                disabled={isLoading}
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteClick(fee.id)}
                                disabled={isLoading}
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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
                        <Label htmlFor="label">Fee Label</Label>
                        <Input
                          id="label"
                          value={formData.label}
                          onChange={(e) => handleFormChange("label", e.target.value)}
                          placeholder="Enter fee label"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fee_name">Fee Name</Label>
                        <Input
                          id="fee_name"
                          value={formData.fee_name}
                          onChange={(e) => handleFormChange("fee_name", e.target.value)}
                          placeholder="Enter fee name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency_type">Currency Type</Label>
                        <Select
                          value={formData.currency_type}
                          onValueChange={(value) => handleFormChange("currency_type", value as "UGX" | "USD" | "EUR")}
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
                          onValueChange={(value) => handleFormChange("fee_type", value as "percentage" | "flat")}
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
                        <Label htmlFor="percentage_value">Value</Label>
                        <Input
                          id="percentage_value"
                          type="number"
                          value={formData.percentage_value}
                          onChange={(e) => handleFormChange("percentage_value", e.target.value)}
                          placeholder={formData.fee_type === "percentage" ? "Enter percentage" : "Enter amount"}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minimum_amount">Minimum Amount</Label>
                        <Input
                          id="minimum_amount"
                          type="number"
                          value={formData.minimum_amount}
                          onChange={(e) => handleFormChange("minimum_amount", e.target.value)}
                          placeholder="Enter minimum amount"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maximum_amount">Maximum Amount (Optional)</Label>
                        <Input
                          id="maximum_amount"
                          type="number"
                          value={formData.maximum_amount}
                          onChange={(e) => handleFormChange("maximum_amount", e.target.value)}
                          placeholder="Enter maximum amount"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="applicable_to">Applicable To</Label>
                        <Select
                          value={formData.applicable_to}
                          onValueChange={(value) => handleFormChange("applicable_to", value as "withdrawals" | "deposits" | "all")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select applicable type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Transactions</SelectItem>
                            <SelectItem value="deposits">Deposits Only</SelectItem>
                            <SelectItem value="withdrawals">Withdrawals Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.active_status === 1}
                            onCheckedChange={(checked) => handleFormChange("active_status", checked ? 1 : 0)}
                          />
                          <span className="text-sm text-gray-500">
                            {formData.active_status === 1 ? "Active" : "Inactive"}
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
          </Tabs>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction fee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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