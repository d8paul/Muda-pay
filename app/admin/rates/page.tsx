"use client"

import { useState, useEffect } from "react"
import { get } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, X } from "lucide-react"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import AddRateModal from "./components/add-rate-modal"
import EditRateModal from "./components/edit-rate-modal"
import DeleteRateModal from "./components/delete-rate-modal"

/**
 * Example rate data:
 * {
 *   "id": "rate_123",
 *   "status": "active",
 *   "base_currency": "UGX",
 *   "quote_currency": "USDT",
 *   "hasCrypto": true,
 *   "referencePrice": "3800.50",
 *   "markup": 2.5,
 *   "markdown": 0.5
 * }
 * 
 * Example response from API:
 * {
 *   "data": [
 *     {
 *       "id": "rate_123",
 *       "status": "active",
 *       "base_currency": "UGX",
 *       "quote_currency": "USDT",
 *       "hasCrypto": true,
 *       "referencePrice": "3800.50",
 *       "markup": 2.5,
 *       "markdown": 0.5
 *     },
 *     {
 *       "id": "rate_124",
 *       "status": "active",
 *       "base_currency": "KES",
 *       "quote_currency": "USDT",
 *       "hasCrypto": true,
 *       "referencePrice": "130.25",
 *       "markup": 1.8,
 *       "markdown": 0.3
 *     }
 *   ]
 * }
 */

interface Rate {
  id: string
  status: "active" | "inactive"
  base_currency: string
  quote_currency: string
  hasCrypto: boolean
  referencePrice: string | null
  markup: number
  markdown: number
}

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([
    {
      id: "rate_123",
      status: "active",
      base_currency: "UGX",
      quote_currency: "USDT",
      hasCrypto: true,
      referencePrice: "3800.50",
      markup: 2.5,
      markdown: 0.5
    }
  ])
  const [filteredRates, setFilteredRates] = useState<Rate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchRates = async () => {
    try {
      setIsLoading(true)
      const response = await get("/admin/pair/prices")
      if (response && Array.isArray(response.data)) {
        setRates(response.data)
        setFilteredRates(response.data)
      } else {
        console.error("Invalid response format:", response)
        toast.error("Invalid response format from server")
        setRates([])
        setFilteredRates([])
      }
    } catch (error) {
      console.error("Error fetching rates:", error)
      toast.error("Failed to fetch rates")
      setRates([])
      setFilteredRates([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  useEffect(() => {
    let filtered = [...rates]

    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter((rate) =>
        rate.base_currency.toLowerCase().includes(nameFilter.toLowerCase()) ||
        rate.quote_currency.toLowerCase().includes(nameFilter.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((rate) => rate.status === statusFilter)
    }

    setFilteredRates(filtered)
  }, [rates, nameFilter, statusFilter])

  const handleEdit = (rate: Rate) => {
    setSelectedRate(rate)
    setShowEditModal(true)
  }

  const handleDelete = (rate: Rate) => {
    setSelectedRate(rate)
    setShowDeleteModal(true)
  }

  const clearFilters = () => {
    setNameFilter("")
    setStatusFilter("all")
  }

  const calculateExchangeRate = (rate: Rate) => {
    if (!rate.hasCrypto || !rate.referencePrice) return "N/A"
    
    const baseRate = parseFloat(rate.referencePrice)
    const markupAmount = baseRate * (rate.markup / 100)
    const markdownAmount = baseRate * (rate.markdown / 100)
    const finalRate = baseRate + markupAmount - markdownAmount
    
    return `1 ${rate.base_currency} = ${finalRate.toFixed(8)} ${rate.quote_currency}`
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Rates Management</h1>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-sky-500 hover:bg-sky-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(nameFilter || statusFilter !== "all") && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Exchange Rate</TableHead>
                    <TableHead>Markup (%)</TableHead>
                    <TableHead>Markdown (%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        {rate.base_currency}/{rate.quote_currency}
                        {rate.hasCrypto && (
                          <span className="ml-2 text-xs text-blue-600">(Crypto)</span>
                        )}
                      </TableCell>
                      <TableCell>{calculateExchangeRate(rate)}</TableCell>
                      <TableCell>{rate.markup}%</TableCell>
                      <TableCell>{rate.markdown}%</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rate.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rate.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(rate)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(rate)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No rates found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>

      <AddRateModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false)
          fetchRates()
        }}
      />

      {selectedRate && (
        <>
          <EditRateModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedRate(null)
            }}
            rate={selectedRate}
            onSuccess={() => {
              setShowEditModal(false)
              setSelectedRate(null)
              fetchRates()
            }}
          />

          <DeleteRateModal
            open={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedRate(null)
            }}
            rate={selectedRate}
            onSuccess={() => {
              setShowDeleteModal(false)
              setSelectedRate(null)
              fetchRates()
            }}
          />
        </>
      )}
    </>
  )
} 