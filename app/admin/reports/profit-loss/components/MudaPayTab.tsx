"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { get } from "@/utils/api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import ExportButton from "@/components/ui/export-button"
import { ExportField } from "@/utils/exportService"

interface Transaction {
  trans_type: string
  trans_id: string
  amount: string
  asset_code: string
  currency: string
  status: string
  created_at: string
  muda_fees: string
  provider_fees: string
  profit: string
}

interface DatePeriod {
  start: string
  end: string
}

interface Filters {
  trans_type: string
}

interface TransactionResponse {
  status: number
  message: string
  data: {
    transactions: Transaction[]
    dateRange: DatePeriod
    filters: Filters
  }
}

interface SearchFilters {
  searchTerm: string
  currency: string
  dateRange: DateRange | undefined
  datePreset: string
}

// Helper function to get date ranges for presets
const getDateRangeForPreset = (preset: string): DateRange | undefined => {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  switch (preset) {
    case 'today':
      return {
        from: startOfToday,
        to: today
      }
    case 'last_week':
      return {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: today
      }
    case 'last_month':
      return {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: today
      }
    case 'last_3_months':
      return {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: today
      }
    default:
      return {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: today
      }
  }
}

const MudaPayTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState<DatePeriod | null>(null)
  const [responseFilters, setResponseFilters] = useState<Filters | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    currency: "UGX",
    datePreset: "last_week",
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      to: new Date(), // today
    }
  })

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.dateRange?.from) {
        queryParams.append('start_date', filters.dateRange.from.toISOString().split('T')[0])
      }
      if (filters.dateRange?.to) {
        queryParams.append('end_date', filters.dateRange.to.toISOString().split('T')[0])
      }
      if (filters.currency && filters.currency !== "all") {
        queryParams.append('currency', filters.currency)
      }

      const response = await get(`/admin/reports/profit/mudapay?${queryParams.toString()}`)
      console.log("Response: ", response)
      
      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to fetch profit reports')
      }

      // Check if response.data exists and has the expected structure
      if (!response.data) {
        throw new Error('No data received from server')
      }

      setTransactions(response.data.transactions || [])
      setDateRange(response.data.dateRange || null)
      setResponseFilters(response.data.filters || null)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to fetch transactions")
      setTransactions([])
      setDateRange(null)
      setResponseFilters(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters.currency, filters.dateRange])

  const handleFilterChange = (key: keyof SearchFilters, value: string | DateRange | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleDatePresetChange = (preset: string) => {
    const newDateRange = getDateRangeForPreset(preset)
    setFilters(prev => ({
      ...prev,
      datePreset: preset,
      dateRange: newDateRange || prev.dateRange
    }))
  }

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      currency: "UGX",
      datePreset: "last_week",
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (filters.currency === "all" || transaction.currency === filters.currency) &&
      (!filters.searchTerm ||
        transaction.trans_id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        transaction.amount.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        transaction.asset_code.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    )
  })

  // Calculate totals from filtered transactions
  const totalProfit = filteredTransactions.reduce((sum, transaction) => {
    const profit = parseFloat(transaction.profit) || 0
    return sum + profit
  }, 0)

  const totalMudaFees = filteredTransactions.reduce((sum, transaction) => {
    const mudaFees = parseFloat(transaction.muda_fees) || 0
    return sum + mudaFees
  }, 0)

  const totalProviderFees = filteredTransactions.reduce((sum, transaction) => {
    const providerFees = parseFloat(transaction.provider_fees) || 0
    return sum + providerFees
  }, 0)

  // Get the selected currency for display
  const selectedCurrency = filters.currency || 'UGX'

  // Export configuration
  const exportFields: ExportField[] = [
    { key: 'created_at', label: 'Date', type: 'date' },
    { key: 'trans_id', label: 'Transaction ID', type: 'string' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'asset_code', label: 'Asset Code', type: 'string' },
    { key: 'currency', label: 'Currency', type: 'string' },
    { key: 'status', label: 'Status', type: 'string' },
    { key: 'provider_fees', label: 'Provider Fees', type: 'currency' },
    { key: 'muda_fees', label: 'Muda Fees', type: 'currency' },
    { key: 'profit', label: 'Profit', type: 'currency' },
    { key: 'trans_type', label: 'Transaction Type', type: 'string' },
  ]

  const exportSummary = [
    {
      label: 'Total Transactions',
      value: filteredTransactions.length.toString()
    },
    {
      label: 'Total Muda Fees',
      value: `${selectedCurrency} ${totalMudaFees.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      label: 'Total Provider Fees',
      value: `${selectedCurrency} ${totalProviderFees.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      label: 'Total Profit',
      value: `${selectedCurrency} ${totalProfit.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }
  ]

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        {/* Header with Title and Export Button */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MudaPay Transactions</h3>
            <p className="text-sm text-gray-600">Analyze MudaPay transaction profits and fees</p>
          </div>
          <ExportButton
            data={filteredTransactions}
            fields={exportFields}
            filename={`mudapay-profit-report-${new Date().toISOString().split('T')[0]}`}
            title="MudaPay Profit Report"
            dateRange={filters.dateRange}
            summary={exportSummary}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Total Muda Fees</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-900">
                  {selectedCurrency} {totalMudaFees.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Total Provider Fees</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-900">
                  {selectedCurrency} {totalProviderFees.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-900">Total Profit</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-900">
                  {selectedCurrency} {totalProfit.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {dateRange && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Report Period</h3>
            <p className="text-sm text-blue-700">
              {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </p>
            {responseFilters && (
              <p className="text-sm text-blue-700">
                Transaction Type: {responseFilters.trans_type}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Input
              type="text"
              placeholder="Search by ID, amount, or asset..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>
          <div>
            <Select value={filters.datePreset} onValueChange={handleDatePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filters.currency} onValueChange={(value) => handleFilterChange("currency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UGX">UGX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(range: DateRange | undefined) => setFilters(prev => ({ ...prev, dateRange: range }))}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Muda Fees</TableHead>
              <TableHead>Provider Fees</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.trans_id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell className="font-mono text-sm">{transaction.trans_id}</TableCell>
                  <TableCell>
                    {parseFloat(transaction.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>{transaction.currency}</TableCell>
                  <TableCell>
                    {transaction.muda_fees ? parseFloat(transaction.muda_fees).toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }) : "0.00"}
                  </TableCell>
                  <TableCell>
                    {transaction.provider_fees ? parseFloat(transaction.provider_fees).toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }) : "0.00"}
                  </TableCell>
                  <TableCell>
                    {transaction.profit ? parseFloat(transaction.profit).toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }) : "0.00"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Transaction ID</Label>
                    <p className="mt-1 font-mono text-sm">{selectedTransaction.trans_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date</Label>
                    <p className="mt-1">{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Transaction Type</Label>
                    <p className="mt-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {selectedTransaction.trans_type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Asset Code</Label>
                    <p className="mt-1">{selectedTransaction.asset_code}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Amount</Label>
                    <p className="mt-1">
                      {parseFloat(selectedTransaction.amount).toLocaleString()} {selectedTransaction.currency}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Currency</Label>
                    <p className="mt-1">{selectedTransaction.currency}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Muda Fees</Label>
                    <p className="mt-1">
                      {selectedTransaction.muda_fees ? 
                        `${selectedTransaction.currency} ${parseFloat(selectedTransaction.muda_fees).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Provider Fees</Label>
                    <p className="mt-1">
                      {selectedTransaction.provider_fees ? 
                        `${selectedTransaction.currency} ${parseFloat(selectedTransaction.provider_fees).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Profit</Label>
                    <p className="mt-1">
                      {selectedTransaction.profit ? 
                        `${selectedTransaction.currency} ${parseFloat(selectedTransaction.profit).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default MudaPayTab