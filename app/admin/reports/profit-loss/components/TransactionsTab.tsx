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
  trans_type: string
  status: string
  dateRange: DateRange | undefined
}

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState<DatePeriod | null>(null)
  const [responseFilters, setResponseFilters] = useState<Filters | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    trans_type: "all",
    status: "all",
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
      if (filters.trans_type && filters.trans_type !== "all") {
        queryParams.append('trans_type', filters.trans_type)
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
  }, [filters.trans_type, filters.dateRange])

  const handleFilterChange = (key: keyof SearchFilters, value: string | DateRange | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      trans_type: "all",
      status: "all",
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
      (filters.trans_type === "all" || transaction.trans_type === filters.trans_type) &&
      (filters.status === "all" || transaction.status === filters.status) &&
      (!filters.searchTerm ||
        transaction.trans_id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        transaction.amount.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        transaction.asset_code.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    )
  })

  const uniqueValues = {
    transTypes: Array.from(new Set(transactions.map(t => t.trans_type))),
    assetCodes: Array.from(new Set(transactions.map(t => t.asset_code))),
    currencies: Array.from(new Set(transactions.map(t => t.currency)))
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="sm:col-span-2 xl:col-span-2">
            <Input
              type="text"
              placeholder="Search by ID, amount, or asset..."
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
          <div className="xl:col-span-1">
            <Select value={filters.trans_type} onValueChange={(value) => handleFilterChange("trans_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueValues.transTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="xl:col-span-1">
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Asset Code</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Muda Fees</TableHead>
              <TableHead>Provider Fees</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
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
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {transaction.trans_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.trans_id}</TableCell>
                  <TableCell>
                    {parseFloat(transaction.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>{transaction.asset_code}</TableCell>
                  <TableCell>{transaction.currency}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.muda_fees || "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.provider_fees || "N/A"}
                  </TableCell>
                  <TableCell>
                    {transaction.profit || "N/A"}
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
                    <p className="mt-1">{selectedTransaction.muda_fees || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Provider Fees</Label>
                    <p className="mt-1">{selectedTransaction.provider_fees || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Profit</Label>
                    <p className="mt-1">{selectedTransaction.profit || "N/A"}</p>
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

export default TransactionsTab 