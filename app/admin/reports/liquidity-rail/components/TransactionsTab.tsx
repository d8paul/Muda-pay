"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { get } from "@/utils/api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DateRange } from "react-day-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays } from "date-fns"

interface Transaction {
  id: number
  transId: string
  company_id: string
  send_asset: string
  send_amount: string
  receive_currency: string
  receive_amount: number
  ex_rate: string
  receiver_address: string
  pay_in_status: string
  status: string
  sending_address: string
  response_body: string | null
  reason: string | null
  created_on: string
  provider_ref_id: string
  provider_address: string
  provider_memo: string
  fee: string
  narration: string | null
  hash: string | null
  payment_mtd_id: number
  auto_id: number
  payment_method: {
    id: string
    kotani_customer_key: string
    type: string
    currency: string
    phone_number: string
    country_code: string
    network: string
    account_name: string
    bank_name: string | null
    bank_code: string | null
    account_number: string | null
    bank_address: string | null
    bank_phone_number: string | null
    bank_country: string | null
    sort_code: string | null
    swift_code: string | null
    created_at: string
    updated_at: string
  }
  service_provider: {
    provider_service_id: number
    service_id: number
    provider_id: number
    min_amount: number
    max_amount: number
    service: {
      service_code: string
      service_name: string
      country: string
      provider_type: string
    }
  }
}

interface Pagination {
  current_page: number
  next_page: number | null
  previous_page: number | null
  total_pages: number
  total_items: number
  items_per_page: number
}

interface TransactionResponse {
  items: Transaction[]
  pagination: Pagination
}

interface SearchFilters {
  searchTerm: string
  status: string
  payInStatus: string
  sendAsset: string
  receiveCurrency: string
  provider: string
  dateRange: DateRange | undefined
}

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    status: "",
    payInStatus: "",
    sendAsset: "",
    receiveCurrency: "",
    provider: "all",
    dateRange: undefined
  })
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    next_page: null,
    previous_page: null,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10
  })

  const fetchTransactions = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.items_per_page.toString(),
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
        ...(filters.payInStatus && filters.payInStatus !== "all" && { pay_in_status: filters.payInStatus }),
        ...(filters.sendAsset && filters.sendAsset !== "all" && { send_asset: filters.sendAsset }),
        ...(filters.receiveCurrency && filters.receiveCurrency !== "all" && { receive_currency: filters.receiveCurrency }),
        ...(filters.provider !== "all" && { provider: filters.provider }),
        ...(filters.searchTerm && { search: filters.searchTerm }),
        ...(filters.dateRange && { start_date: filters.dateRange.from?.toISOString(), end_date: filters.dateRange.to?.toISOString() })
      })

      const response = await get(`/admin/reports/rails/transactions?${queryParams.toString()}`)
      console.log("Response: ", response.data)
      const data = response.data as TransactionResponse
      
      setTransactions(data.items)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to fetch transactions")
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(1)
  }, [filters, pagination.items_per_page])

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }))
    fetchTransactions(page)
  }

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      status: "all",
      payInStatus: "all",
      sendAsset: "all",
      receiveCurrency: "all",
      provider: "all",
      dateRange: undefined
    })
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESSFUL":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "EXPIRED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const uniqueValues = {
    sendAssets: Array.from(new Set(transactions.map(t => t.send_asset))),
    receiveCurrencies: Array.from(new Set(transactions.map(t => t.receive_currency))),
    providers: Array.from(new Set(transactions.map(t => t.service_provider.service.service_name)))
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Input
              type="text"
              placeholder="Search by ID, account, narration or fee..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>
          <div>
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(range: DateRange | undefined) => setFilters(prev => ({ ...prev, dateRange: range }))}
            />
          </div>
          <div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filters.payInStatus} onValueChange={(value) => handleFilterChange("payInStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pay-in Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pay-in Status</SelectItem>
                <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filters.sendAsset} onValueChange={(value) => handleFilterChange("sendAsset", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Send Asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                {uniqueValues.sendAssets.map(asset => (
                  <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filters.receiveCurrency} onValueChange={(value) => handleFilterChange("receiveCurrency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Receive Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                {uniqueValues.receiveCurrencies.map(currency => (
                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div>
            <Select value={filters.provider} onValueChange={(value) => handleFilterChange("provider", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {uniqueValues.providers.map(provider => (
                  <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Send</TableHead>
              <TableHead>Receive</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pay-in Status</TableHead>
              <TableHead>Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <TableCell>{formatDate(transaction.created_on)}</TableCell>
                  <TableCell>
                    {transaction.send_amount} {transaction.send_asset}
                  </TableCell>
                  <TableCell>
                    {transaction.receive_amount.toLocaleString()} {transaction.receive_currency}
                  </TableCell>
                  <TableCell>{transaction.service_provider.service.service_name}</TableCell>
                  <TableCell>{transaction.payment_method.network}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.pay_in_status)}`}>
                      {transaction.pay_in_status}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.fee}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.previous_page}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.next_page}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Showing {((pagination.current_page - 1) * pagination.items_per_page) + 1} to {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} of {pagination.total_items} entries
            </div>
          </div>
        )}

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
                    <p className="mt-1 font-mono text-sm">{selectedTransaction.transId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date</Label>
                    <p className="mt-1">{formatDate(selectedTransaction.created_on)}</p>
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
                    <Label className="text-sm font-medium text-gray-500">Pay-in Status</Label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTransaction.pay_in_status)}`}>
                        {selectedTransaction.pay_in_status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Provider</Label>
                    <p className="mt-1">{selectedTransaction.service_provider.service.service_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Network</Label>
                    <p className="mt-1">{selectedTransaction.payment_method.network}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Send Amount</Label>
                    <p className="mt-1">
                      {selectedTransaction.send_amount} {selectedTransaction.send_asset}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Receive Amount</Label>
                    <p className="mt-1">
                      {selectedTransaction.receive_amount.toLocaleString()} {selectedTransaction.receive_currency}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Exchange Rate</Label>
                    <p className="mt-1">{selectedTransaction.ex_rate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fee</Label>
                    <p className="mt-1">{selectedTransaction.fee}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account Name</Label>
                    <p className="mt-1">{selectedTransaction.payment_method.account_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                    <p className="mt-1">{selectedTransaction.payment_method.phone_number}</p>
                  </div>
                  {selectedTransaction.narration && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Narration</Label>
                      <p className="mt-1">{selectedTransaction.narration}</p>
                    </div>
                  )}
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