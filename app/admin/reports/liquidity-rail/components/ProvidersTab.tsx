"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { get } from "@/utils/api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"

interface Provider {
  id: number
  name: string
  type: string
  status: string
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
      const response = await get(`/admin/reports/rails/providers?page=${page}`)
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

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Search by provider name or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No providers found
                </TableCell>
              </TableRow>
            ) : (
              filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>{provider.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(provider.status)}`}>
                      {provider.status}
                    </span>
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