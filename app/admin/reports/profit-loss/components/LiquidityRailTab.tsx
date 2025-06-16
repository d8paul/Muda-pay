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

interface Transaction {
  created_on: string
  ex_rate: string
  transId: string
  amount: string
  currency: string
  spread: string
  fee: string
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
  dateRange: DateRange | undefined
}

const LiquidityRailTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState<DatePeriod | null>(null)
  const [responseFilters, setResponseFilters] = useState<Filters | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
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

      const response = await get(`/admin/reports/profit/liquidityrailnetwork?${queryParams.toString()}`)
      console.log("Liquidity Rail Response: ", response)
      
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
        transactionsData = response.data.transactions || response.data || []
        dateRangeData = response.data.dateRange || null
        filtersData = response.data.filters || null
      }
      
      setTransactions(transactionsData)
      setDateRange(dateRangeData)
      setResponseFilters(filtersData)
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

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
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
      (!filters.searchTerm ||
        transaction.transId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        transaction.amount.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        transaction.currency.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    )
  })

  // Calculate total profit from filtered transactions (fee is the profit)
  const totalProfit = filteredTransactions.reduce((sum, transaction) => {
    const profit = parseFloat(transaction.fee) || 0
    return sum + profit
  }, 0)

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        {/* Date Range Display */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900">Report Period</h3>
          {filters.dateRange?.from && filters.dateRange?.to ? (
            <p className="text-sm text-blue-700">
              {filters.dateRange.from.toLocaleString()} - {filters.dateRange.to.toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-blue-700">No date range selected</p>
          )}
        </div>
        
        {/* Total Profit Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Total Profit</h3>
              <p className="text-xs text-blue-700">
                Based on {filteredTransactions.length} transactions in selected range
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">
                {totalProfit.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
              <p className="text-xs text-blue-700">Total Profit</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <div className="sm:col-span-2 xl:col-span-2">
            <Input
              type="text"
              placeholder="Search by transaction ID, amount, or currency..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>
          <div className="xl:col-span-1">
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
              <TableHead>Spread</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
                    {parseFloat(transaction.amount).toLocaleString()} {transaction.currency}
                  </TableCell>
                  <TableCell>
                    {transaction.spread || "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.fee || "N/A"}
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
                    <Label className="text-sm font-medium text-gray-500">Transaction ID</Label>
                    <p className="mt-1 font-mono text-sm">{selectedTransaction.transId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date</Label>
                    <p className="mt-1">{formatDate(selectedTransaction.created_on)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Exchange Rate</Label>
                    <p className="mt-1">{selectedTransaction.ex_rate || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Currency</Label>
                    <p className="mt-1">{selectedTransaction.currency}</p>
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
                    <Label className="text-sm font-medium text-gray-500">Spread</Label>
                    <p className="mt-1">{selectedTransaction.spread || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fee (Profit)</Label>
                    <p className="mt-1">{selectedTransaction.fee || "N/A"}</p>
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
