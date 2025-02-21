"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/utils/currency"
import { get } from "@/utils/api"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"

export default function AdminWalletPage() {
  const [balances, setBalances] = useState([])
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState({ code: "UGX" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWalletBalances = async () => {
      setIsLoading(true)
      try {
        const response = await get("/admin/balances")
        setBalances(response.data)
      } catch (error) {
        console.error("Failed to fetch wallet balances:", error)
        toast.error("Failed to load wallet balances")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletBalances()
  }, [])

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Wallet</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Wallet Balances</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  {balances.map((balance, index) => (
                    <div
                      key={balance.id}
                      className={
                        index % 2 === 0
                          ? "bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                          : "bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                      }
                    >
                      <dt className="text-sm font-medium text-gray-500">{balance.currency} Balance</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-1">
                        {balance.balance} {balance.asset_code}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}