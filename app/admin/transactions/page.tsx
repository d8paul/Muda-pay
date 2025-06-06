"use client"

import { useState, useEffect } from "react"
import TransactionFilter from "@/components/TransactionFilter"
import { formatCurrency } from "@/utils/currency"
import TableWithPagination from "@/components/ui/TableWithPagination"
import { get, post } from '@/utils/api'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Transaction {
  id: number
  client_id: string
  validation_id: string
  product_id: string
  trans_type: string
  trans_id: string
  reference_id: string
  stellar_tx_id: string | null
  amount: string
  asset_code: string
  currency: string
  sender_account: string
  receiver_account: string
  memo: string
  status: string
  created_at: string
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

const columns = [
  { 
    key: "created_at", 
    label: "Date",
    render: (row: Transaction) => formatDate(row.created_at)
  },
  { key: "amount", label: "Amount" },
  { key: "asset_code", label: "Currency" },
  { key: "product_id", label: "Product ID" },
  { key: "receiver_account", label: "Receiver Account" },
  { key: "reference_id", label: "Reference ID" },
  { key: "status", label: "Status" },
]

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [transactionsPerPage] = useState(10)
  const [selectedCurrency, setSelectedCurrency] = useState({ code: "UGX" })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { hasPermission } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    // Check if user has permission to view transactions
    if (!hasPermission('transactions.view')) {
      router.push('/admin/dashboard')
      return
    }
  }, [hasPermission, router])

  useEffect(() => {
    const storedCurrency = localStorage.getItem("selectedCurrency")
    if (storedCurrency) {
      setSelectedCurrency(JSON.parse(storedCurrency))
    }
  }, [])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await get("admin/transactions")
        setTransactions(response.data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }
    fetchTransactions()
  }, [])

  const handleRowClick = (transaction: Transaction) => {
    // Check if user has permission to view transaction details
    if (!hasPermission('transactions.view')) {
      return
    }
    setSelectedTransaction(transaction)
    setIsDetailsOpen(true)
  }

  const formatAmount = (amount: string, assetCode: string) => {
    // Remove the 'c' prefix if it exists
    const cleanAssetCode = assetCode.startsWith('c') ? assetCode.substring(1) : assetCode
    return formatCurrency(parseFloat(amount), cleanAssetCode)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "text-green-600",
      pending: "text-yellow-600",
      failed: "text-red-600",
      mint_failed: "text-red-600",
    }
    return colors[status.toLowerCase()] || "text-gray-600"
  }

  // If user doesn't have permission, don't render the content
  if (!hasPermission('transactions.view')) {
    return null
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <TransactionFilter />
          <TableWithPagination 
            data={transactions} 
            columns={columns} 
            itemsPerPage={transactionsPerPage}
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer hover:bg-gray-50"
          />
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1">{formatDate(selectedTransaction.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="mt-1">{formatAmount(selectedTransaction.amount, selectedTransaction.asset_code)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Currency</h3>
                  <p className="mt-1">{selectedTransaction.asset_code}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Product ID</h3>
                  <p className="mt-1">{selectedTransaction.product_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction Type</h3>
                  <p className="mt-1">{selectedTransaction.trans_type}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Receiver Account</h3>
                  <p className="mt-1">{selectedTransaction.receiver_account}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reference ID</h3>
                  <p className="mt-1">{selectedTransaction.reference_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className={`mt-1 ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status || 'Pending'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                  <p className="mt-1">{selectedTransaction.trans_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client ID</h3>
                  <p className="mt-1">{selectedTransaction.client_id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

