"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { get } from "@/utils/api"
import { ChevronLeft, Building2, DollarSign } from "lucide-react"

// Import components
import { ProviderFeesTab, PendingProviderFeesTab, EditProviderFeeModal } from "../components"

interface Provider {
  id: string
  name: string
  code: string
  type: string
  status: "active" | "inactive" | "suspended"
  supported_currencies: string[]
  description?: string
  created_at: string
}

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

interface PendingProviderFee {
  id: string
  provider_id: string
  entry_type: "CREATE" | "UPDATE" | "DELETE"
  status: "pending" | "approved" | "rejected"
  reason?: string
  original_fee_id?: string
  data_content: ProviderFee
  maker_id: string
  checker_id?: string
  created_at: string
  approved_at?: string
}

export default function ManageProviderFeesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const providerId = searchParams.get("provider_id")
  const providerName = searchParams.get("provider_name")

  const [provider, setProvider] = useState<Provider | null>(null)
  const [providerFees, setProviderFees] = useState<ProviderFee[]>([])
  const [pendingFees, setPendingFees] = useState<PendingProviderFee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("provider-fees")
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<ProviderFee | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (providerId) {
      // fetchProviderDetails() // Commented out - endpoint may not be implemented
      fetchProviderFees()
      // fetchPendingFees() // Commented out - endpoint may not be implemented
    }
  }, [providerId])

  // Commented out - endpoint may not be implemented yet
  // const fetchProviderDetails = async () => {
  //   if (!providerId) return
  //   
  //   try {
  //     const response = await get(`/admin/providers/${providerId}`)
  //     if (response.status === 200 && response.data) {
  //       // Handle both nested and direct data structures
  //       const providerData = response.data.data || response.data
  //       setProvider(providerData)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching provider details:", error)
  //     toast.error("Failed to fetch provider details")
  //   }
  // }

  const fetchProviderFees = async () => {
    if (!providerId) return
    
    setIsLoading(true)
    try {
      const response = await get(`/admin/providers/${providerId}/fees`)
      if (response.status === 200 && response.data && Array.isArray(response.data.items)) {
        setProviderFees(response.data.items)
      } else {
        setProviderFees([])
      }
    } catch (error) {
      console.error("Error fetching provider fees:", error)
      toast.error("Failed to fetch provider fees")
      setProviderFees([])
    } finally {
      setIsLoading(false)
    }
  }

  // Commented out - endpoint may not be implemented yet
  // const fetchPendingFees = async () => {
  //   if (!providerId) return
  //   
  //   try {
  //     const response = await get(`/admin/providers/${providerId}/fees/pending`)
  //     if (response.status === 200 && response.data && Array.isArray(response.data.items)) {
  //       setPendingFees(response.data.items)
  //     } else {
  //       setPendingFees([])
  //     }
  //   } catch (error) {
  //     console.error("Error fetching pending fees:", error)
  //     // Don't show error for pending fees as they might not exist
  //     setPendingFees([])
  //   }
  // }

  // Commented out - Create fees functionality disabled for now
  // const handleCreateFee = () => {
  //   setEditingFee(null)
  //   setIsCreating(true)
  //   setIsEditModalOpen(true)
  // }

  const handleEditFee = (fee: ProviderFee) => {
    setEditingFee(fee)
    setIsCreating(false)
    setIsEditModalOpen(true)
  }

  const handleModalClose = () => {
    setIsEditModalOpen(false)
    setEditingFee(null)
    setIsCreating(false)
  }

  const handleFeeUpdated = (isNewFee: boolean = false) => {
    // Refresh the fees lists
    fetchProviderFees()
    // fetchPendingFees() // Commented out - endpoint not available
    handleModalClose()
    
    // Since create functionality is disabled, only handle fee updates
    // Stay on the provider-fees tab since pending tab is disabled
    setActiveTab("provider-fees")
    toast.success("Fee updated successfully")
  }

  const handleFeeApproved = () => {
    // After approval, redirect to the "Active" tab (provider-fees)
    fetchProviderFees()
    // fetchPendingFees() // Commented out - endpoint not available
    setActiveTab("provider-fees")
    toast.success("Fee approved successfully")
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!providerId) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Invalid Provider</h1>
          <p className="text-gray-500 mt-1">Provider ID is required to manage fees.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push("/admin/provider-fees")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Providers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push("/admin/provider-fees")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Providers
          </Button>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {providerName || provider?.name || "Provider"} - Fee Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage fee structures and approval workflow for this provider
              </p>
            </div>
          </div>

          {/* Simplified Provider Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {providerName || `Provider ${providerId}`} - Fee Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Provider ID</p>
                  <p className="text-sm font-semibold">{providerId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Provider Name</p>
                  <p className="text-sm font-semibold">{providerName || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Fees</p>
                  <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                    {providerFees.length} fees configured
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Fee Management */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="provider-fees">
                Provider's Fees ({providerFees.length})
              </TabsTrigger>
              {/* Commented out until endpoint is implemented */}
              {/* <TabsTrigger value="pending-fees">
                Pending Provider's Fees ({pendingFees.length})
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="provider-fees">
              <ProviderFeesTab
                providerId={providerId}
                providerName={providerName || "Provider"}
                fees={providerFees}
                supportedCurrencies={[]} // Empty array since provider details endpoint not available
                isLoading={isLoading}
                onCreateFee={() => {}} // Commented out - Create fees functionality disabled
                onEditFee={handleEditFee}
                onRefreshFees={fetchProviderFees}
              />
            </TabsContent>

            {/* Commented out until endpoint is implemented */}
            {/* <TabsContent value="pending-fees">
              <PendingProviderFeesTab
                providerId={providerId}
                pendingFees={pendingFees}
                isLoading={isLoading}
                onRefreshFees={() => {
                  fetchPendingFees()
                  fetchProviderFees() // Also refresh main fees in case something was approved
                }}
                onFeeApproved={handleFeeApproved}
              />
            </TabsContent> */}
          </Tabs>
        </div>
      </div>

      {/* Edit/Create Fee Modal - Commented out create functionality */}
      {!isCreating && (
        <EditProviderFeeModal
          open={isEditModalOpen}
          onClose={handleModalClose}
          providerId={providerId}
          supportedCurrencies={provider?.supported_currencies || []}
          editingFee={editingFee}
          isCreating={false}
          onSuccess={handleFeeUpdated}
        />
      )}
    </>
  )
}
