"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { get } from "@/utils/api"
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  CurrencyDollarIcon,
  BuildingOffice2Icon 
} from "@heroicons/react/24/outline"

interface Provider {
  provider_id: number
  name: string
  created_at: string
  approval_status: "active" | "inactive" | "suspended"
  rates_endpoint: string | null
  tradeMetrics: {
    spreadPercentage: string
    profit: string
    assumedMidMarketRate: string
  }
  // Optional fields that might be added later
  code?: string
  type?: string
  supported_currencies?: string[]
  fee_structure?: {
    has_fees: boolean
    total_fees: number
    pending_fees: number
  }
}

interface ProviderStats {
  total_providers: number
  active_providers: number
  inactive_providers: number
  providers_with_fees: number
  total_fees_configured: number
  pending_fees: number
}

export default function ProvidersListPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [stats, setStats] = useState<ProviderStats | null>(null)
  const [filter, setFilter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProviders()
    // fetchStats() // Commented out - API endpoint not implemented yet
  }, [])

  const fetchProviders = async () => {
    setIsLoading(true)
    try {
      const response = await get("/admin/providers")
      if (response.status === 200 && response.data && Array.isArray(response.data.items)) {
        setProviders(response.data.items)
      } else {
        setProviders([])
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
      toast.error("Failed to fetch providers")
      setProviders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Commented out - API endpoint not implemented yet
  // const fetchStats = async () => {
  //   try {
  //     const response = await get("/admin/providers/stats")
  //     if (response.status === 200 && response.data) {
  //       setStats(response.data)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching provider stats:", error)
  //     // Don't show error toast for stats as it's not critical
  //   }
  // }

  const handleViewFees = (providerId: number, providerName: string) => {
    router.push(`/admin/provider-fees/manage?provider_id=${providerId}&provider_name=${encodeURIComponent(providerName)}`)
  }

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(filter.toLowerCase()) ||
    (provider.code && provider.code.toLowerCase().includes(filter.toLowerCase())) ||
    (provider.type && provider.type.toLowerCase().includes(filter.toLowerCase())) ||
    provider.approval_status.toLowerCase().includes(filter.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Provider Fees Management</h1>
              <p className="text-gray-500 mt-1">Manage provider fee structures and configurations</p>
            </div>
          </div>

          {/* Stats Cards - Commented out until API endpoint is implemented */}
          {/* {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                  <BuildingOffice2Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_providers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.active_providers} active, {stats.inactive_providers} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Providers with Fees</CardTitle>
                  <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.providers_with_fees}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {stats.total_providers} total providers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fees Configured</CardTitle>
                  <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_fees_configured}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all active providers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                  <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending_fees}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>
            </div>
          )} */}

          {/* Search and Filter */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by provider name or status..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setFilter("")
                  fetchProviders()
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Providers Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Provider ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-muted-foreground">Loading providers...</span>
                        </div>
                      ) : filter ? (
                        <p className="text-muted-foreground">No providers found matching your search.</p>
                      ) : (
                        <p className="text-muted-foreground">No providers found. Check your connection or contact support.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.provider_id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>{provider.provider_id}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(provider.approval_status)}>
                          {provider.approval_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(provider.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFees(provider.provider_id, provider.name)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Fees
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  )
}
