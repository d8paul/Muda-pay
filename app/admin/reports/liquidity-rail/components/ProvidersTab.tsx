"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { liquidityRailApi } from "@/utils/liquidityRailApi"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"

interface Provider {
  provider_id: number
  name: string
  created_at: string
  approval_status: string
  rates_endpoint: string | null
}

interface ProviderResponse {
  items: Provider[]
  pagination: {
    current_page: number
    next_page: number | null
    previous_page: number | null
    total_pages: number
    total_items: number
    items_per_page: number
  }
}

const ProvidersTab = () => {
  const [providers, setProviders] = useState<Provider[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<ProviderResponse['pagination']>({
    current_page: 1,
    next_page: null,
    previous_page: null,
    total_pages: 1,
    total_items: 0,
    items_per_page: 14
  })

  const fetchProviders = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const response = await liquidityRailApi.getProviders(page)
      const data = response.data as ProviderResponse
      setProviders(data.items || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching providers:", error)
      toast.error("Failed to fetch providers")
      setProviders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [])

  const handlePageChange = (page: number) => {
    fetchProviders(page)
  }

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" ? true : provider.approval_status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const uniqueStatuses = [...new Set(providers.map(p => p.approval_status))]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Search by provider name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider ID</TableHead>
              <TableHead>Provider Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Rates Endpoint</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No providers found
                </TableCell>
              </TableRow>
            ) : (
              filteredProviders.map((provider) => (
                <TableRow key={provider.provider_id}>
                  <TableCell>{provider.provider_id}</TableCell>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(provider.approval_status)}`}>
                      {provider.approval_status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(provider.created_at)}</TableCell>
                  <TableCell>
                    {provider.rates_endpoint ? (
                      <span className="text-sm text-blue-600 truncate" title={provider.rates_endpoint}>
                        {provider.rates_endpoint.length > 30 
                          ? `${provider.rates_endpoint.substring(0, 30)}...` 
                          : provider.rates_endpoint}
                      </span>
                    ) : (
                      <span className="text-gray-400">No endpoint</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {filteredProviders.length} of {pagination.total_items} providers
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                disabled={!pagination.previous_page}
                onClick={() => handlePageChange(pagination.previous_page!)}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                disabled={!pagination.next_page}
                onClick={() => handlePageChange(pagination.next_page!)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProvidersTab 