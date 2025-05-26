"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { get } from "@/utils/api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"

interface Provider {
  provider_service_id: number
  service_id: number
  provider_id: number
  min_amount: number
  max_amount: number
  auto_id: number
  service_code: string
  service_name: string
  country: string
  currency: string
  provider_type: string
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
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
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

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = 
      provider.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCountry = selectedCountry === "all" ? true : provider.country === selectedCountry
    const matchesCurrency = selectedCurrency === "all" ? true : provider.currency === selectedCurrency
    const matchesType = selectedType === "all" ? true : provider.provider_type === selectedType

    return matchesSearch && matchesCountry && matchesCurrency && matchesType
  })

  const uniqueCountries = [...new Set(providers.map(p => p.country))]
  const uniqueCurrencies = [...new Set(providers.map(p => p.currency))]
  const uniqueTypes = [...new Set(providers.map(p => p.provider_type))]

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount)
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Search by service name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {uniqueCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Service Code</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Min Amount</TableHead>
              <TableHead>Max Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No providers found
                </TableCell>
              </TableRow>
            ) : (
              filteredProviders.map((provider) => (
                <TableRow key={provider.provider_service_id}>
                  <TableCell>{provider.service_name}</TableCell>
                  <TableCell>{provider.service_code}</TableCell>
                  <TableCell>{provider.country}</TableCell>
                  <TableCell>{provider.currency}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800`}>
                      {provider.provider_type.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{formatAmount(provider.min_amount)}</TableCell>
                  <TableCell>{formatAmount(provider.max_amount)}</TableCell>
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