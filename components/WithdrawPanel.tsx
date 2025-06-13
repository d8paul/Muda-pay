"use client"

import { useState, useEffect } from "react"
import { X, Timer, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { post, get } from "@/utils/api"
import toast from "react-hot-toast"
import Image from "next/image"

const LIQRAIL_URL = "https://rail.stage-mudax.xyz"

interface Balance {
  asset: string;
  chain: string;
  balance: string;
}

interface Service {
  service_id: string;
  service_code: string;
  service_name: string;
  currency: string;
}

interface Provider {
  provider_service_id: number;
  service_id: number;
  provider_id: number;
  min_amount: number;
  max_amount: number;
  name: string;
  service_code: string;
  service_name: string;
  currency: string;
  rate: number;
}

interface WithdrawPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_CURRENCIES = [
  { code: "USDC", chain: "ETH", name: "USD Coin", icon: "/icons/usdc.png" },
  { code: "USDT", chain: "ETH", name: "Tether", icon: "/icons/usdt.png" },
]

const FIAT_CURRENCIES = [
  { code: "USD", name: "US Dollar", icon: "/icons/usd.png" },
  { code: "UGX", name: "Ugandan Shilling", icon: "/icons/ugx.png" },
]

export default function WithdrawPanel({ isOpen, onClose }: WithdrawPanelProps) {
  const [services, setServices] = useState<Service[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [sendAmount, setSendAmount] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [selectedSendCurrency, setSelectedSendCurrency] = useState(SUPPORTED_CURRENCIES[0])
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState(FIAT_CURRENCIES[0])
  const [quoteExpiry, setQuoteExpiry] = useState(53)

  // Fetch balances
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await get(`${LIQRAIL_URL}/accounts/getBalances`)
        if (response.status === 200) {
          setBalances(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch balances:", error)
      }
    }

    fetchBalances()
  }, [])

  // Quote expiry countdown
  useEffect(() => {
    if (quoteExpiry > 0) {
      const timer = setInterval(() => {
        setQuoteExpiry(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quoteExpiry])

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await get(`${LIQRAIL_URL}/accounts/getServices`)
        if (response.status === 200) {
          setServices(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch services:", error)
        toast.error("Failed to load services")
      }
    }

    fetchServices()
  }, [])

  // Fetch providers when service is selected
  useEffect(() => {
    const fetchProviders = async () => {
      if (!selectedService) return

      try {
        const response = await post(`${LIQRAIL_URL}/accounts/provider`, {
          asset: selectedSendCurrency.code,
          currency: selectedReceiveCurrency.code
        })

        if (Array.isArray(response)) {
          setProviders(response)
          if (response.length > 0) {
            setSelectedProvider(response[0])
          }
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error)
        toast.error("Failed to load providers")
      }
    }

    fetchProviders()
  }, [selectedService, selectedSendCurrency.code, selectedReceiveCurrency.code])

  // Update receive amount when send amount changes
  useEffect(() => {
    if (selectedProvider && sendAmount) {
      const amount = parseFloat(sendAmount)
      const converted = (amount * selectedProvider.rate).toFixed(2)
      setReceiveAmount(converted)
    }
  }, [sendAmount, selectedProvider])

  const getCurrentBalance = () => {
    const balance = balances.find(b => 
      b.asset === selectedSendCurrency.code && b.chain === selectedSendCurrency.chain
    )
    return balance?.balance || "0.00"
  }

  const handleMaxClick = () => {
    const balance = getCurrentBalance()
    setSendAmount(balance)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!selectedProvider) {
        throw new Error("Please select a provider")
      }

      if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (!accountNumber.trim()) {
        throw new Error("Please enter a valid account number")
      }

      const quoteData = {
        provider_id: selectedProvider.provider_id.toString(),
        send_asset: selectedSendCurrency.code,
        send_amount: Number(sendAmount),
        account_number: accountNumber,
        receive_currency: selectedReceiveCurrency.code,
        receive_amount: Number(receiveAmount),
        service_id: selectedProvider.service_id.toString(),
        chain: selectedSendCurrency.chain,
        source: "wallet",
        ex_rate: selectedProvider.rate,
        receiver_address: "Kampala, Uganda",
        payment_method_id: "1", // This should be dynamic based on your requirements
        sending_address: "" // This should be dynamic based on your wallet
      }

      const response = await post(`${LIQRAIL_URL}/accounts/generateQuote`, quoteData)

      if (response.status === 200) {
        toast.success("Quote generated successfully")
        handleReset()
        onClose()
      } else {
        throw new Error(response.message || "Failed to generate quote")
      }
    } catch (error: any) {
      console.error("Quote generation failed:", error)
      setError(error.message || "Failed to generate quote")
      toast.error(error.message || "Failed to generate quote")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedService("")
    setSelectedProvider(null)
    setSendAmount("")
    setReceiveAmount("")
    setAccountNumber("")
    setError(null)
    setQuoteExpiry(53)
  }

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b flex justify-between items-center bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl text-foreground">SEND FUNDS</h2>
            <p className="text-sm text-muted-foreground">Send money to mobile money or bank account</p>
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
              <h3 className="text-base font-medium">My account</h3>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Send Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="text-sm">
                    Balance: {getCurrentBalance()} 
                    <button 
                      type="button"
                      onClick={handleMaxClick}
                      className="ml-2 text-primary hover:underline"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    min="0"
                    step="any"
                    required
                    className="w-full"
                  />
                  <Select 
                    value={selectedSendCurrency.code} 
                    onValueChange={(value) => {
                      const currency = SUPPORTED_CURRENCIES.find(c => c.code === value)
                      if (currency) setSelectedSendCurrency(currency)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {selectedSendCurrency.code} ({selectedSendCurrency.chain})
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={`${currency.code}-${currency.chain}`} value={currency.code}>
                          <div className="flex items-center gap-2">
                            {currency.code} ({currency.chain})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowUpDown className="text-muted-foreground" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Recipient Receives <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={receiveAmount}
                    readOnly
                    className="w-full bg-muted"
                  />
                  <Select 
                    value={selectedReceiveCurrency.code}
                    onValueChange={(value) => {
                      const currency = FIAT_CURRENCIES.find(c => c.code === value)
                      if (currency) setSelectedReceiveCurrency(currency)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {selectedReceiveCurrency.code}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {FIAT_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            {currency.code}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProvider && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Rate: 1 {selectedSendCurrency.code} = {selectedProvider.rate} {selectedReceiveCurrency.code}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="w-full"
              />
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
              {isSubmitting ? "Processing..." : "Send"}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-md p-4">
            <Timer className="h-4 w-4" />
            <p>Quote Expires in {quoteExpiry} Secs</p>
          </div>
        </div>
      </div>
    </div>
  )
} 