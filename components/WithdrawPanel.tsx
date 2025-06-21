"use client"

import { useState, useEffect } from "react"
import { X, ArrowUpRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { get, post } from "@/utils/api"
import toast from "react-hot-toast"

 
export interface TransferData {
  amount: string;
  trans_type: string | "CRYPTO_TRANSFER" | "LIQUIDITY_RAIL";
  asset: string;
  token: string;
  memo?: string;
  payment_method_id: string;
  to_address?: string;
  quote_id?: string;
  clientId?: string;
}


interface WithdrawPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_CURRENCIES = [
  { code: "USDC", chain: "ETH", name: "USD Coin" },
  { code: "USDT", chain: "ETH", name: "Tether" },
  { code: "USDC", chain: "STELLAR", name: "USD Coin" },
  { code: "USDT", chain: "STELLAR", name: "Tether" },
]

const CHAINS = [
  { code: "ETH", name: "Ethereum" },
  { code: "STELLAR", name: "Stellar" },
  { code: "POLYGON", name: "Polygon" },
  { code: "BSC", name: "Binance Smart Chain" },
]

interface Balance {
  balance: string;
  currency: string;
  asset_issuer: string;
  id: string;
  asset_code: string;
}

interface WithdrawPanelProps {
  isOpen: boolean;
  onClose: () => void;
  balances?: Balance[];
}

export default function WithdrawPanel({ isOpen, onClose, balances = [] }: WithdrawPanelProps) {
  const [amount, setAmount] = useState("")
  const [address, setAddress] = useState("")
  const [memo, setMemo] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(SUPPORTED_CURRENCIES[0])
  const [selectedChain, setSelectedChain] = useState(CHAINS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const getCurrentBalance = () => {
    const balance = balances.find(b =>
      b.asset_code === selectedCurrency.code && b.asset_issuer === selectedChain.code
    )
    return balance?.balance || "0.00"
  }

  const handleMaxClick = () => {
    const balance = getCurrentBalance()
    setAmount(balance)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (!address.trim()) {
        throw new Error("Please enter a valid destination address")
      }

      const transferData:TransferData = {
        asset: selectedCurrency.code,
        amount: (amount),
        to_address: address,
        memo: memo || undefined,
        trans_type: "CRYPTO_TRANSFER",
        clientId: "1",
        token: "1",
        payment_method_id: "1",
      }

      const response = await post(`payment/admin/send-transaction`, transferData)

      if (response.status === 200) {
        toast.success("Transfer initiated successfully")
        handleReset()
        onClose()
      } else {
        throw new Error(response.message || "Failed to initiate transfer")
      }
    } catch (error: any) {
      console.error("Transfer failed:", error)
      setError(error.message || "Failed to initiate transfer")
      toast.error(error.message || "Failed to initiate transfer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setAmount("")
    setAddress("")
    setMemo("")
    setError(null)
  }

  const getFilteredCurrencies = () => {
    return SUPPORTED_CURRENCIES.filter(currency => currency.chain === selectedChain.code)
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b flex justify-between items-center bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl text-foreground">CRYPTO TRANSFER OUT</h2>
            <p className="text-sm text-muted-foreground">Send crypto to external address</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-background to-muted/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Chain <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedChain.code}
                  onValueChange={(value) => {
                    const chain = CHAINS.find(c => c.code === value)
                    if (chain) {
                      setSelectedChain(chain)
                      // Reset currency to first available for new chain
                      const availableCurrencies = SUPPORTED_CURRENCIES.filter(c => c.chain === value)
                      if (availableCurrencies.length > 0) {
                        setSelectedCurrency(availableCurrencies[0])
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {selectedChain.name}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CHAINS.map((chain) => (
                      <SelectItem key={chain.code} value={chain.code}>
                        <div className="flex items-center gap-2">
                          {chain.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Asset <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedCurrency.code}
                  onValueChange={(value) => {
                    const currency = getFilteredCurrencies().find(c => c.code === value)
                    if (currency) setSelectedCurrency(currency)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {selectedCurrency.code} - {selectedCurrency.name}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredCurrencies().map((currency) => (
                      <SelectItem key={`${currency.code}-${currency.chain}`} value={currency.code}>
                        <div className="flex items-center gap-2">
                          {currency.code} - {currency.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="text-sm">
                    Balance: {getCurrentBalance()} {selectedCurrency.code}
                    <button
                      type="button"
                      onClick={handleMaxClick}
                      className="ml-2 text-primary hover:underline"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="any"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Destination Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder={`Enter ${selectedChain.name} address`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Memo (Optional)
                </label>
                <Textarea
                  placeholder="Enter memo/tag if required"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              {isSubmitting ? "Processing Transfer..." : "Send Transfer"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Double-check the destination address and chain.
              Transfers cannot be reversed once confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
