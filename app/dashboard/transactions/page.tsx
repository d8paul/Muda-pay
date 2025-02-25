"use client"

import { useState, useEffect } from "react"
import TransactionFilter from "@/components/TransactionFilter"
import { formatCurrency } from "@/utils/currency"
import TableWithPagination from "@/components/ui/TableWithPagination"
import {get,post} from '@/utils/api'

const columns = [
  { key: "created_at", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "trans_type", label: "Trans Type" },
  { key: "currency", label: "Currency" },
  { key: "product_id", label: "Product ID" },
  { key: "receiver_account", label: "Receiver Account" },
  { key: "status", label: "Status" }
]

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [transactionsPerPage] = useState(10)
  const [selectedCurrency, setSelectedCurrency] = useState({ code: "UGX" })

  useEffect(() => {
    const storedCurrency = localStorage.getItem("selectedCurrency")
    if (storedCurrency) {
      setSelectedCurrency(JSON.parse(storedCurrency))
    }
  }, [])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await get("payment/statement")
        setTransactions(response.data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }
    fetchTransactions()
  }, [])
 
 
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <TransactionFilter />
          <TableWithPagination data={transactions} columns={columns} itemsPerPage={transactionsPerPage} />
        
        </div>
      </div>
    </div>
  )
}

