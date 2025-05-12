"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProgressBar from "@/components/ProgressBar"
import { get, post } from "@/utils/api"
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
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
  name: string
  type: "percentage" | "fixed"
  value: number
  minAmount: number
  maxAmount: number | null
  applicableTo: string
  status: "active" | "inactive"
  updatedAt: string
}

interface FeeFormData {
  name: string
  type: "percentage" | "fixed"
  value: string
  minAmount: string
  maxAmount: string
  applicableTo: string
  status: "active" | "inactive"
}

const initialFormData: FeeFormData = {
  name: "",
  type: "percentage",
  value: "",
  minAmount: "",
  maxAmount: "",
  applicableTo: "all",
  status: "active"
}

export default function BusinessFeesPage() {
  const searchParams = useSearchParams()
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
          get(`/admin/company-fees/${clientId}`),
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
    if (!feeToDelete) return

    setIsLoading(true)
    try {
      await get(`/admin/company-fees/${clientId}/delete/${feeToDelete}`)
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
      name: fee.name,
      type: fee.type,
      value: fee.value.toString(),
      minAmount: fee.minAmount.toString(),
      maxAmount: fee.maxAmount?.toString() || "",
      applicableTo: fee.applicableTo,
      status: fee.status
    })
    setEditingFeeId(fee.id)
    setIsEditing(true)
    setActiveTab("create-fee")
  }

  const handleFormChange = (field: keyof FeeFormData, value: string | boolean) => {
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
        value: parseFloat(formData.value),
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        client_id: clientId
      }

      if (isEditing && editingFeeId) {
        await post(`/admin/company-fees/${clientId}/update/${editingFeeId}`, payload)
        toast.success("Fee updated successfully")
      } else {
        await post("/admin/company-fees/create", payload)
        toast.success("Fee created successfully")
      }

      // Refresh fees list
      const response = await get(`/admin/company-fees/${clientId}`)
      setFees(response.data || [])
      
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
                      <TableHead className="w-[180px]">Fee Name</TableHead>
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
                        <TableCell colSpan={9} className="text-center py-10">
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
                          <TableCell className="font-medium">{fee.name}</TableCell>
                          <TableCell className="capitalize">{fee.type}</TableCell>
                          <TableCell>
                            {fee.type === "percentage"
                              ? `${fee.value}%`
                              : `UGX ${formatCurrency(fee.value)}`}
                          </TableCell>
                          <TableCell>UGX {formatCurrency(fee.minAmount)}</TableCell>
                          <TableCell>
                            {fee.maxAmount
                              ? `UGX ${formatCurrency(fee.maxAmount)}`
                              : "No limit"}
                          </TableCell>
                          <TableCell className="capitalize">{fee.applicableTo}</TableCell>
                          <TableCell>
                            <Badge
                              variant={fee.status === "active" ? "default" : "secondary"}
                              className={
                                fee.status === "active"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }
                            >
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(fee.updatedAt)}</TableCell>
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
                        <Label htmlFor="name">Fee Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleFormChange("name", e.target.value)}
                          placeholder="Enter fee name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Fee Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleFormChange("type", value as "percentage" | "fixed")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          type="number"
                          value={formData.value}
                          onChange={(e) => handleFormChange("value", e.target.value)}
                          placeholder={formData.type === "percentage" ? "Enter percentage" : "Enter amount"}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minAmount">Minimum Amount</Label>
                        <Input
                          id="minAmount"
                          type="number"
                          value={formData.minAmount}
                          onChange={(e) => handleFormChange("minAmount", e.target.value)}
                          placeholder="Enter minimum amount"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxAmount">Maximum Amount (Optional)</Label>
                        <Input
                          id="maxAmount"
                          type="number"
                          value={formData.maxAmount}
                          onChange={(e) => handleFormChange("maxAmount", e.target.value)}
                          placeholder="Enter maximum amount"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="applicableTo">Applicable To</Label>
                        <Select
                          value={formData.applicableTo}
                          onValueChange={(value) => handleFormChange("applicableTo", value)}
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