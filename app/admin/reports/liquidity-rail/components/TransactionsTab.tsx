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

interface Transaction {
  id: number
  transId: string
  send_asset: string
  send_amount: string
  receive_currency: string
  receive_amount: number
  ex_rate: string
  account_number: string
  status: string
  pay_in_status: string
  created_on: string
  fee: string
  narration: string | null
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
  sendAsset: string
  receiveCurrency: string
}

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    status: "all",
    sendAsset: "all",
    receiveCurrency: "all"
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchTransactions = async (page: number = 1, append: boolean = false) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "14",
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.sendAsset !== 'all' && { send_asset: filters.sendAsset }),
        ...(filters.receiveCurrency !== 'all' && { receive_currency: filters.receiveCurrency }),
        ...(filters.searchTerm && { search: filters.searchTerm })
      })

      const response = await get(`/admin/reports/rails/transactions?${queryParams.toString()}`)
      const data = response.data as TransactionResponse
      
      if (append) {
        setTransactions(prev => [...prev, ...data.items])
      } else {
        setTransactions(data.items)
      }
      
      setHasMore(data.pagination.next_page !== null)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to fetch transactions")
      if (!append) {
        setTransactions([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchTransactions(1, false)
  }, [filters.status, filters.sendAsset, filters.receiveCurrency, filters.searchTerm])

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchTransactions(nextPage, true)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
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
                {Array.from(new Set(transactions.map(t => t.send_asset))).map(asset => (
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
                {Array.from(new Set(transactions.map(t => t.receive_currency))).map(currency => (
                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Send</TableHead>
              <TableHead>Receive</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
                  <TableCell>{transaction.account_number}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.fee}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
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
                    <p className="mt-1">{selectedTransaction.transId}</p>
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
                    <Label className="text-sm font-medium text-gray-500">Account Number</Label>
                    <p className="mt-1">{selectedTransaction.account_number}</p>
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