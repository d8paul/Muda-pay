"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { liquidityRailApi } from "@/utils/liquidityRailApi"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Client {
  company_id: number
  name: string
  business_name: string | null
  email: string
  phone: string | null
  currencies: string
  assets: string
  country: string | null
  user_type: string
  kyc_status: string
  email_verified: string
}

interface ClientResponse {
  status: number
  message: string
  data: {
    items: Client[]
    pagination: {
      current_page: number
      next_page: number | null
      previous_page: number | null
      total_pages: number
      total_items: number
      items_per_page: string
    }
  }
}

interface ClientsTabProps {
  onClientSelect: (clientId: string) => void
}

interface Filters {
  search: string
  kycStatus: string
  emailVerified: string
}

const ClientsTab = ({ onClientSelect }: ClientsTabProps) => {
  const [clients, setClients] = useState<Client[]>([])
  const [filters, setFilters] = useState<Filters>({
    search: "",
    kycStatus: "all",
    emailVerified: "all"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<ClientResponse['data']['pagination']>({
    current_page: 1,
    next_page: null,
    previous_page: null,
    total_pages: 1,
    total_items: 0,
    items_per_page: "10"
  })

  const debouncedFetchClients = useCallback(
    async (page: number = 1) => {
      setIsLoading(true)
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          search: filters.search,
          status: filters.kycStatus !== "all" ? filters.kycStatus : "",
          email_verified: filters.emailVerified !== "all" ? filters.emailVerified : ""
        })

        const response = await liquidityRailApi.getClients(queryParams.toString())
        const data = response as ClientResponse
        setClients(data.data.items || [])
        setPagination(data.data.pagination)
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast.error("Failed to fetch clients")
        setClients([])
      } finally {
        setIsLoading(false)
      }
    },
    [filters]
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedFetchClients(1)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [filters, debouncedFetchClients])

  const handlePageChange = (page: number) => {
    debouncedFetchClients(page)
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "unverified":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEmailVerifiedColor = (status: string) => {
    return status === "yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pr-8"
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
          
          <Select
            value={filters.kycStatus}
            onValueChange={(value) => handleFilterChange("kycStatus", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="KYC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All KYC Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.emailVerified}
            onValueChange={(value) => handleFilterChange("emailVerified", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Email Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Email Status</SelectItem>
              <SelectItem value="yes">Verified</SelectItem>
              <SelectItem value="no">Not Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Email Verified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="text-gray-500">Loading clients...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="text-gray-500">
                    {filters.search || filters.kycStatus !== "all" || filters.emailVerified !== "all" ? (
                      <>
                        <p>No clients found matching your search criteria.</p>
                        <button
                          onClick={() => setFilters({
                            search: "",
                            kycStatus: "all",
                            emailVerified: "all"
                          })}
                          className="text-indigo-600 hover:text-indigo-900 mt-2"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      "No clients found"
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow 
                  key={client.company_id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onClientSelect(client.company_id.toString())}
                >
                  <TableCell>{client.business_name || client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <Badge className={getKycStatusColor(client.kyc_status)}>
                      {client.kyc_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEmailVerifiedColor(client.email_verified)}>
                      {client.email_verified === "yes" ? "Verified" : "Not Verified"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {clients.length} of {pagination.total_items} clients
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

export default ClientsTab 