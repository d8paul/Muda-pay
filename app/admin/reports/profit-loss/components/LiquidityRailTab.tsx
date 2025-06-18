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
  id: number
  transId: string
  provider_id: string
  company_id: number
  send_asset: string
  send_amount: string
  receive_currency: string
  receive_amount: number
  payable_amount: string
  ex_rate: string
  account_number: string
  service_id: string
  receiver_address: string
  pay_in_status: string
  status: string
  sending_address: string
  response_body: string | null
  reason: string | null
  created_on: string
  bank_name: string
  bank_code: string
  provider_ref_id: string
  provider_address: string
  provider_memo: string
  fee: string
  fee_currency: string
  payment_method_id: string
  narration: string | null
  hash: string | null
  mudafeelog_id: number
  muda_fee: string
  thirdparty_fee: string
  thirdparty_quote: string
  thirdparty_rate: string
  blockchain_fee: string
  blockchain_fee_asset: string
  fee_log_rate: string
  fee_log_created_at: string
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
    items: Transaction[]
    dateRange?: DatePeriod
    filters?: Filters
  }
}

interface SearchFilters {
  searchTerm: string
  dateRange: DateRange | undefined
  datePreset: string
  currency: string
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
    case 'custom':
    default:
      return undefined
  }
}

const LiquidityRailTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState<DatePeriod | null>(null)
  const [responseFilters, setResponseFilters] = useState<Filters | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    datePreset: "last_week",
    currency: "all",
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
      // Don't send currency filter to API - we'll handle filtering on frontend
      // This allows us to get all currencies and build the dropdown dynamically

      const response = await get(`/admin/reports/profit/liquidityrailnetwork?${queryParams.toString()}`)
      console.log("Liquidity Rail Response: ", response)
      console.log("Response data type:", typeof response.data)
      console.log("Response data:", response.data)
      
      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to fetch liquidity rail profit reports')
      }

      // Check if response.data exists and has the expected structure
      if (!response.data) {
        throw new Error('No data received from server')
      }

      // Handle different possible response structures
      let transactionsData = []
      let dateRangeData = null
      let filtersData = null
      
      if (response.data) {
        // Check if items is an array, if not use empty array
        const rawTransactions = response.data.items || response.data.transactions || response.data || []
        console.log("Raw transactions:", rawTransactions)
        console.log("Raw transactions type:", typeof rawTransactions)
        console.log("Is array?", Array.isArray(rawTransactions))
        
        transactionsData = Array.isArray(rawTransactions) ? rawTransactions : []
        dateRangeData = response.data.dateRange || null
        filtersData = response.data.filters || null
        
        console.log("Final transactions data:", transactionsData)
      }
      
      setTransactions(transactionsData)
      setDateRange(dateRangeData)
      setResponseFilters(filtersData)
      
      // Set default currency to first currency in the list if not already set
      if (transactionsData.length > 0 && filters.currency === "all") {
        const currencies = [...new Set(transactionsData.map((t: Transaction) => t.fee_currency || "Unknown"))]
          .filter((currency): currency is string => Boolean(currency))
          .sort()
        
        if (currencies.length > 0) {
          setFilters(prev => ({ ...prev, currency: currencies[0] }))
        }
      }
    } catch (error) {
      console.error("Error fetching liquidity rail transactions:", error)
      toast.error("Failed to fetch liquidity rail transactions")
      setTransactions([])
      setDateRange(null)
      setResponseFilters(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters.dateRange])

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
      datePreset: "last_week",
      currency: "all",
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
  const filteredTransactions = Array.isArray(transactions) ? transactions.filter((transaction) => {
    const matchesSearch = (!filters.searchTerm ||
      transaction.transId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      transaction.send_amount.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      transaction.send_asset.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      transaction.receive_currency.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    
    // Handle currency filtering - treat null fee_currency as "Unknown"
    const transactionCurrency = transaction.fee_currency || "Unknown"
    const matchesCurrency = filters.currency === "all" || transactionCurrency === filters.currency

    return matchesSearch && matchesCurrency
  }) : []

  // Get unique profit currencies for filter dropdown (only fee_currency)
  const uniqueCurrencies = Array.isArray(transactions) ? 
    [...new Set(transactions.map(t => t.fee_currency || "Unknown"))].filter((currency): currency is string => Boolean(currency)).sort() : []

  // Calculate total profit from filtered transactions (muda_fee is the profit)
  const totalProfit = filteredTransactions.reduce((sum, transaction) => {
    const profit = parseFloat(transaction.muda_fee) || 0
    return sum + profit
  }, 0)

  // Get the selected currency for display
  const selectedCurrencyDisplay = filters.currency === "all" ? "" : filters.currency

  // Export configuration
  const exportFields: ExportField[] = [
    { key: 'created_on', label: 'Date', type: 'date' },
    { key: 'transId', label: 'Transaction ID', type: 'string' },
    { key: 'fee_currency', label: 'Currency', type: 'string', format: (value) => value || "Unknown" },
    { key: 'send_amount', label: 'Amount', type: 'number', format: (value) => parseFloat(value || '0').toFixed(4) },
    { key: 'muda_fee', label: 'Muda Fee', type: 'number', format: (value) => parseFloat(value || '0').toFixed(4) },
    { key: 'blockchain_fee', label: 'Blockchain Fee', type: 'number', format: (value) => parseFloat(value || '0').toFixed(4) },
    { key: 'thirdparty_fee', label: 'Third Party Fee', type: 'number', format: (value) => parseFloat(value || '0').toFixed(4) },
    { key: 'muda_fee', label: 'Profit', type: 'number', format: (value) => parseFloat(value || '0').toFixed(4) },
    { key: 'send_asset', label: 'Send Asset', type: 'string' },
    { key: 'receive_amount', label: 'Receive Amount', type: 'number' },
    { key: 'receive_currency', label: 'Receive Currency', type: 'string' },
    { key: 'ex_rate', label: 'Exchange Rate', type: 'string' },
    { key: 'status', label: 'Status', type: 'string' },
  ]

  const exportSummary = [
    {
      label: 'Total Transactions',
      value: filteredTransactions.length.toString()
    },
    {
      label: 'Total Profit',
      value: totalProfit.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  ]

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        {/* Header with Title and Export Button */}
        <div className="flex justify-between items-center">
          <div>
            {/* <h3 className="text-lg font-semibold text-gray-900">Liquidity Rail Transactions</h3> */}
          </div>
          {/* <ExportButton
            data={filteredTransactions}
            fields={exportFields}
            filename={`liquidity-rail-report-${new Date().toISOString().split('T')[0]}`}
            title="Liquidity Rail Profit Report"
            dateRange={filters.dateRange}
            summary={exportSummary}
          /> */}
        </div>

        {/* Date Range Display */}
        {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900">Report Period</h3>
          {filters.dateRange?.from && filters.dateRange?.to ? (
            <p className="text-sm text-blue-700">
              {filters.dateRange.from.toLocaleString()} - {filters.dateRange.to.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-blue-700">No date range selected</p>
          )}
        </div> */}
        
        {/* Total Profit Summary */}
        <div className="w-1/3">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Total Profit</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  {totalProfit.toLocaleString('en-US', { 
                    minimumFractionDigits: 4, 
                    maximumFractionDigits: 4 
                  })}
                  {selectedCurrencyDisplay && ` ${selectedCurrencyDisplay}`}
                </p>
                <p className="text-xs text-blue-700">Total Profit</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Filters</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by transaction ID, amount, or currency..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Profit Currency
              </label>
              <Select value={filters.currency} onValueChange={(value) => handleFilterChange("currency", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
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
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <Select value={filters.datePreset} onValueChange={handleDatePresetChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Custom Date Range - Show only when custom is selected */}
          {filters.datePreset === 'custom' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Custom Date Range
              </label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range: DateRange | undefined) => setFilters(prev => ({ ...prev, dateRange: range, datePreset: 'custom' }))}
              />
            </div>
          )}
          
          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Active Filters:</span>
              {filters.searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Search: "{filters.searchTerm}"
                </span>
              )}
              {filters.currency !== "all" && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Currency: {filters.currency}
                </span>
              )}
              {filters.dateRange?.from && filters.dateRange?.to && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                  {filters.datePreset === 'custom' ? 'Custom' : filters.datePreset.replace('_', ' ')} Date Range
                </span>
              )}
              {(!filters.searchTerm && filters.currency === "all" && !filters.dateRange?.from) && (
                <span className="text-gray-500 italic">No filters applied</span>
              )}
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Muda Fee</TableHead>
              <TableHead>Blockchain Fee</TableHead>
              <TableHead>Total Revenue</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.transId}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <TableCell>{formatDate(transaction.created_on)}</TableCell>
                  <TableCell className="font-mono text-sm">{transaction.transId}</TableCell>
                  <TableCell>
                    {transaction.fee_currency || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {transaction.send_amount ? parseFloat(transaction.send_amount).toFixed(4) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.muda_fee ? parseFloat(transaction.muda_fee).toFixed(4) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.blockchain_fee ? parseFloat(transaction.blockchain_fee).toFixed(4) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.thirdparty_fee ? parseFloat(transaction.thirdparty_fee).toFixed(4) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.muda_fee ? parseFloat(transaction.muda_fee).toFixed(4) : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Liquidity Rail Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Hash</Label>
                    <p className="mt-1 font-mono text-xs break-all">{selectedTransaction.hash || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Muda Fee Log ID</Label>
                    <p className="mt-1">{selectedTransaction.mudafeelog_id || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Muda Fee</Label>
                    <p className="mt-1 font-mono">
                      {selectedTransaction.muda_fee ? parseFloat(selectedTransaction.muda_fee).toFixed(8) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Third Party Fee</Label>
                    <p className="mt-1 font-mono">
                      {selectedTransaction.thirdparty_fee ? parseFloat(selectedTransaction.thirdparty_fee).toFixed(8) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Third Party Quote</Label>
                    <p className="mt-1 font-mono text-xs break-all">{selectedTransaction.thirdparty_quote || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Third Party Rate</Label>
                    <p className="mt-1 font-mono">
                      {selectedTransaction.thirdparty_rate ? parseFloat(selectedTransaction.thirdparty_rate).toFixed(8) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Blockchain Fee</Label>
                    <p className="mt-1 font-mono">
                      {selectedTransaction.blockchain_fee ? parseFloat(selectedTransaction.blockchain_fee).toFixed(8) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Blockchain Fee Asset</Label>
                    <p className="mt-1">{selectedTransaction.blockchain_fee_asset || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fee Log Rate</Label>
                    <p className="mt-1 font-mono">
                      {selectedTransaction.fee_log_rate ? parseFloat(selectedTransaction.fee_log_rate).toFixed(8) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fee Log Created At</Label>
                    <p className="mt-1">{selectedTransaction.fee_log_created_at ? formatDate(selectedTransaction.fee_log_created_at) : "N/A"}</p>
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

export default LiquidityRailTab
