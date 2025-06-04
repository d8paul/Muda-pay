"use client"

import { useState, useEffect } from "react"
import { get, post } from "@/utils/api"
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
import { Plus, Pencil, Trash2, Search, X, CheckCircle, Loader2, Eye } from "lucide-react"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import AddRateModal from "../components/add-rate-modal"
import EditRateModal from "../components/approval-rate-modal"
import DeleteRateModal from "../components/delete-rate-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { usePermissions } from '@/app/hooks/usePermissions'


interface Rate {
  id: string
  maker_id: string
  checker_id: string | null
  entry_type: string
  status: string
  reason: string | null
  data_content: {
    id: string
    base_currency: string
    quote_currency: string
    created_at: string
    pair: string
    hasCrypto: boolean
    referencePrice: string
    markup: number
    markdown: number
  }
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface SelectedRate {
  id: string
  status: "active" | "inactive" | "pending"
  base_currency: string
  quote_currency: string
  hasCrypto: boolean
  referencePrice: string
  markup: number
  markdown: number
}

interface CurrencyOption {
  asset_code: string
  currency: string
}

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([
    // {
    //   id: "rate_123",
    //   status: "active",
    //   base_currency: "UGX",
    //   quote_currency: "USDT",
    //   hasCrypto: true,
    //   referencePrice: "3800.50",
    //   markup: 2.5,
    //   markdown: 0.5
    // }
  ])
  const [filteredRates, setFilteredRates] = useState<Rate[]>([])
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRate, setSelectedRate] = useState<SelectedRate | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRateDetails, setSelectedRateDetails] = useState<Rate | null>(null)
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currencyFilter, setCurrencyFilter] = useState<string>("all")

  const { hasRequiredPermission } = usePermissions('Approve rates')

  const fetchRates = async () => {
    try {
      setIsLoading(true)
      const response = await get("/admin/pair/prices/pending")
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
  }, [nameFilter, currencyFilter])

  useEffect(() => {
    let filtered = [...rates]

    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter((rate) =>
        rate.data_content.base_currency.toLowerCase().includes(nameFilter.toLowerCase()) ||
        rate.data_content.quote_currency.toLowerCase().includes(nameFilter.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((rate) => rate.status === statusFilter)
    }

    // Apply currency filter
    if (currencyFilter !== "all") {
      filtered = filtered.filter((rate) => rate.data_content.base_currency === currencyFilter)
    }

    setFilteredRates(filtered)
  }, [rates, nameFilter, statusFilter, currencyFilter])

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await get("/clients/currencies")
        setCurrencyOptions(response.data)
      } catch (error) {
        console.error("Error fetching currencies:", error)
        toast.error("Failed to fetch currencies")
      }
    }
    fetchCurrencies()
  }, [])

  const handleEdit = (rate: Rate) => {
    const { id, status, data_content } = rate
    const { id: _, ...content } = data_content
    setSelectedRate({
      id,
      status: status as "active" | "inactive" | "pending",
      ...content
    })
    setShowEditModal(true)
  }

  const handleDelete = (rate: Rate) => {
    const { id, status, data_content } = rate
    const { id: _, ...content } = data_content
    setSelectedRate({
      id,
      status: status as "active" | "inactive" | "pending",
      ...content
    })
    setShowDeleteModal(true)
  }

  const handleApprove = (rate: Rate) => {
    const { id, status, data_content } = rate
    const { id: _, ...content } = data_content
    setSelectedRate({
      id,
      status: status as "active" | "inactive" | "pending",
      ...content
    })
    setShowEditModal(true)
  }

  const handleRowClick = (rate: Rate) => {
    setSelectedRateDetails(rate)
    setShowDetailsModal(true)
  }

  const handleApproveRate = async () => {
    if (!selectedRateDetails) return

    try {
      setIsLoading(true)
      await post(`/admin/pair/prices/${selectedRateDetails.id}/approve`)
      toast.success("Rate approved successfully")
      setShowDetailsModal(false)
      fetchRates() // Refresh the list
    } catch (error) {
      console.error("Error approving rate:", error)
      toast.error("Failed to approve rate")
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setNameFilter("")
    setStatusFilter("all")
  }

  const calculateExchangeRate = (rate: Rate) => {
    if (!rate.data_content.hasCrypto || !rate.data_content.referencePrice) return "N/A"
    
    const baseRate = parseFloat(rate.data_content.referencePrice)
    const markupAmount = baseRate * (rate.data_content.markup / 100)
    const markdownAmount = baseRate * (rate.data_content.markdown / 100)
    const finalRate = baseRate + markupAmount - markdownAmount
    return `1 ${rate.data_content.base_currency} = ${finalRate.toFixed(8)} ${rate.data_content.quote_currency}`
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Pending Rates Management</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by base currency or quote currency..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by base currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Default Pairs</SelectItem>
                    {currencyOptions.map(opt => (
                      <SelectItem key={opt.asset_code} value={opt.asset_code}>
                        {opt.asset_code} ({opt.currency})
                      </SelectItem>
                    ))}
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
                    <TableHead>Pair</TableHead>
                    <TableHead>Markup</TableHead>
                    <TableHead>Markdown</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <div className="flex justify-center items-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No rates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRates.map((rate) => (
                      <TableRow 
                        key={rate.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(rate)}
                      >
                        <TableCell>
                          {rate.data_content.base_currency}/{rate.data_content.quote_currency}
                        </TableCell>
                        <TableCell>{rate.data_content.markup}%</TableCell>
                        <TableCell>{rate.data_content.markdown}%</TableCell>
                        <TableCell className="capitalize">{rate.entry_type.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{new Date(rate.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {hasRequiredPermission && (
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleApprove(rate)
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
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
            onClose={(option: any) => {
              setShowEditModal(option)
              setSelectedRate(null)
            }}
            rate={selectedRate}
            fetchRates={fetchRates}
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
            onConfirm={() => {
              setShowDeleteModal(false)
              setSelectedRate(null)
              fetchRates()
            }}
          />
        </>
      )}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate Details</DialogTitle>
          </DialogHeader>
          {selectedRateDetails && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Pair</Label>
                <div className="col-span-3">
                  {selectedRateDetails.data_content.base_currency}/{selectedRateDetails.data_content.quote_currency}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Markup</Label>
                <div className="col-span-3">{selectedRateDetails.data_content.markup}%</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Markdown</Label>
                <div className="col-span-3">{selectedRateDetails.data_content.markdown}%</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Entry Type</Label>
                <div className="col-span-3 capitalize">{selectedRateDetails.entry_type.replace(/_/g, ' ')}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created At</Label>
                <div className="col-span-3">{new Date(selectedRateDetails.created_at).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3 capitalize">{selectedRateDetails.status}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {hasRequiredPermission && (
              <Button 
                onClick={handleApproveRate}
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve Rate'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 