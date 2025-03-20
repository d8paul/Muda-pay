"use client"

import { useState, useEffect } from "react"
import { get } from "@/utils/api"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Copy, CheckCircle, RefreshCw, QrCode } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QRCodeSVG } from "qrcode.react"
import toast from "react-hot-toast"

// Keep fallback QR code component for cases where the library might not load
const FallbackQRCode = ({ value, size = 200 }: { value: string, size?: number }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg"
      style={{ width: size, height: size }}
    >
      <QrCode className="w-12 h-12 text-gray-500 mb-2" />
      <span className="text-sm text-gray-500 text-center px-2">QR Code for address</span>
      <span className="text-xs text-gray-400 mt-1 px-2 text-center break-all">{value.substring(0, 12)}...{value.substring(value.length - 8)}</span>
    </div>
  );
};

interface BankDetails {
  id?: number
  bank_name: string
  account_number: string
  account_name: string
  swift_code: string
  reference_code?: string
  country?: string
  currency?: string
  reference?: string
  created_at?: string
}

interface CryptoDetails {
  id?: number
  name?: string
  currency?: string
  network: string
  address?: string
  deposit_address?: string
  logo?: string
  created_at?: string
}

export default function DepositFloatTab() {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "crypto">("bank")
  const [isLoading, setIsLoading] = useState(true)
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState<string>("")
  const [cryptoOptions, setCryptoOptions] = useState<CryptoDetails[]>([])
  const [selectedCryptoDetails, setSelectedCryptoDetails] = useState<CryptoDetails | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Define copyToClipboard here so it's available to all components
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success(`${type} copied to clipboard`)
    setTimeout(() => setCopied(null), 3000)
  }

  // Create a component that tries to use QRCodeSVG but falls back if there's an error
  const QRCodeWithFallback = ({ value, size = 200 }: { value: string, size?: number }) => {
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      setHasError(false);
      setErrorMsg("");
      setIsLoading(true);
      
      // Simulate loading to give time for the QR code to render
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }, [value]);

    if (isLoading) {
      return (
        <div 
          className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg"
          style={{ width: size, height: size }}
        >
          <RefreshCw className="w-10 h-10 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-500 mt-3">Loading QR code...</span>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex flex-col items-center">
          <FallbackQRCode value={value} size={size} />
          {errorMsg && (
            <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
          )}
        </div>
      );
    }

    try {
      return (
        <div className="flex flex-col items-center">
          <div 
            className="cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => copyToClipboard(value, "Crypto address")}
            title="Click to copy address"
          >
            <QRCodeSVG 
              value={value} 
              size={size} 
              level="M"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#000000"
              onError={(error: any) => {
                console.error("QR Code error:", error);
                setErrorMsg("Could not generate QR code. Please copy the address manually.");
                setHasError(true);
              }}
            />
          </div>
        </div>
      );
    } catch (e) {
      console.error("QR Code rendering error:", e);
      setErrorMsg("Could not render QR code. Please copy the address manually.");
      return <FallbackQRCode value={value} size={size} />;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch real data from the API
        const response = await get("clients/paymentMethods")
        
        if (response.status === 200 && response.data) {
          console.log("Payment methods:", response.data)
          
          // Set bank details if available
          if (response.data.bank && response.data.bank.length > 0) {
            const bankData = response.data.bank[0]
            setBankDetails({
              id: bankData.id,
              bank_name: bankData.bank_name,
              account_number: bankData.account_number,
              account_name: bankData.account_name,
              swift_code: bankData.swift_code,
              country: bankData.country,
              currency: bankData.currency,
              reference_code: bankData.reference_code,
              reference: bankData.reference_code, // For compatibility with existing code
              created_at: bankData.created_at
            })
          } else {
            setBankDetails(null)
          }
          
          // Set crypto options if available
          if (response.data.stable && response.data.stable.length > 0) {
            const cryptoData = response.data.stable.map((item: any) => ({
              id: item.id,
              currency: item.currency,
              network: item.network,
              deposit_address: item.deposit_address,
              address: item.deposit_address, // For compatibility with existing code
              name: item.currency, // For compatibility with existing code
              created_at: item.created_at
            }))
            
            setCryptoOptions(cryptoData)
          } else {
            setCryptoOptions([])
          }
        } else {
          throw new Error("Failed to fetch payment methods")
        }
      } catch (error) {
        console.error("Error fetching deposit methods:", error)
        setError("Failed to load payment methods. Please try again later.")
        toast.error("Failed to load payment methods")
        
        // Set fallback data for demonstration purposes
        setBankDetails({
          bank_name: "STANBIC BANK",
          account_number: "9030017849303",
          account_name: "MUDA TECHNOLOGY LTD",
          swift_code: "SBICUGKX",
          reference: "REF-" + Math.floor(Math.random() * 1000000)
        })
        
        setCryptoOptions([
          {
            name: "USDT",
            currency: "USDT",
            network: "tron",
            address: "TQasUWUNVJM2vY5CY7PVt5ZpkbMJiLdae3",
            deposit_address: "TQasUWUNVJM2vY5CY7PVt5ZpkbMJiLdae3"
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCryptoChange = (value: string) => {
    setSelectedCrypto(value);
    try {
      const crypto = cryptoOptions.find(c => `${c.currency}-${c.network}` === value) || null;
      setSelectedCryptoDetails(crypto);
      
      // If the crypto selection changes, let's ensure the QR code is refreshed
      if (crypto) {
        console.log(`Loading QR code for ${crypto.currency} on ${crypto.network}`);
      }
    } catch (error) {
      console.error("Error selecting cryptocurrency:", error);
      toast.error("There was an issue selecting this cryptocurrency. Please try again.");
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`p-6 border cursor-pointer ${
              paymentMethod === "bank" 
                ? "border-[#26a0ff] bg-gray-50 ring-2 ring-[#26a0ff] ring-opacity-30" 
                : "border-gray-200 hover:bg-gray-50"
            } transition-all`}
            onClick={() => setPaymentMethod("bank")}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#e6f4ff] rounded-full flex items-center justify-center text-[#26a0ff] mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-gray-900">Bank Transfer</h3>
                <p className="text-sm text-gray-500">Deposit funds via bank transfer</p>
              </div>
            </div>
          </Card>
          
          <Card
            className={`p-6 border cursor-pointer ${
              paymentMethod === "crypto" 
                ? "border-[#26a0ff] bg-gray-50 ring-2 ring-[#26a0ff] ring-opacity-30" 
                : "border-gray-200 hover:bg-gray-50"
            } transition-all`}
            onClick={() => setPaymentMethod("crypto")}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#e6f4ff] rounded-full flex items-center justify-center text-[#26a0ff] mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-gray-900">Stable Coins</h3>
                <p className="text-sm text-gray-500">Deposit using USDC, USDT, or other stable coins</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8">
          {paymentMethod === "bank" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Bank Transfer Details</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              ) : bankDetails ? (
                <>
                  <div className="bg-[#e6f4ff] border border-[#26a0ff33] rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-[#26a0ff]" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700">
                          Please use the reference code when making your transfer to ensure we can track your deposit.
                        </p>
                      </div>
                    </div>
                  </div>
                
                  <Card className="shadow-sm">
                    <div className="px-4 py-5 sm:p-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                          <dd className="mt-1 text-sm text-gray-900 flex items-center">
                            {bankDetails.bank_name}
                            <button 
                              onClick={() => copyToClipboard(bankDetails.bank_name || "", "Bank name")}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {copied === "Bank name" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                          <dd className="mt-1 text-sm text-gray-900 flex items-center">
                            {bankDetails.account_number}
                            <button 
                              onClick={() => copyToClipboard(bankDetails.account_number || "", "Account number")}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {copied === "Account number" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Account Name</dt>
                          <dd className="mt-1 text-sm text-gray-900 flex items-center">
                            {bankDetails.account_name}
                            <button 
                              onClick={() => copyToClipboard(bankDetails.account_name || "", "Account name")}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {copied === "Account name" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Swift Code</dt>
                          <dd className="mt-1 text-sm text-gray-900 flex items-center">
                            {bankDetails.swift_code}
                            <button 
                              onClick={() => copyToClipboard(bankDetails.swift_code || "", "Swift code")}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {copied === "Swift code" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </dd>
                        </div>
                        {bankDetails.country && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Country</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {bankDetails.country}
                            </dd>
                          </div>
                        )}
                        {bankDetails.currency && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Currency</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {bankDetails.currency}
                            </dd>
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Reference Code (Required)</dt>
                          <dd className="mt-1 text-sm font-medium text-[#26a0ff] flex items-center">
                            {bankDetails.reference_code || bankDetails.reference}
                            <button 
                              onClick={() => copyToClipboard(bankDetails.reference_code || bankDetails.reference || "", "Reference")}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {copied === "Reference" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </Card>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-sm text-gray-700">No bank details are available at this time. Please contact support for assistance.</p>
                </div>
              )}
            </div>
          )}
          
          {paymentMethod === "crypto" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Stable Coin Deposit</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full max-w-md" />
                  <Skeleton className="h-64 w-64 mx-auto" />
                </div>
              ) : cryptoOptions.length > 0 ? (
                <>
                  <div className="max-w-md">
                    <Select value={selectedCrypto} onValueChange={handleCryptoChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a stable coin" />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoOptions.map((option) => (
                          <SelectItem 
                            key={`${option.currency}-${option.network}`} 
                            value={`${option.currency}-${option.network}`}
                          >
                            {option.currency} ({option.network})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedCryptoDetails && (
                    <div className="mt-6">
                      <div className="bg-[#e6f4ff] border border-[#26a0ff33] rounded-md p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-[#26a0ff]" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-700">
                              Please ensure you send {selectedCryptoDetails.currency} only on the {selectedCryptoDetails.network} network. 
                              Sending via another network may result in loss of funds.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="flex flex-col items-center">
                          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <QRCodeWithFallback value={selectedCryptoDetails.deposit_address || selectedCryptoDetails.address || ""} size={200} />
                          </div>
                          <div className="mt-3 text-sm text-gray-500">
                            Tap to copy address
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                              Deposit Address ({selectedCryptoDetails.currency} - {selectedCryptoDetails.network})
                            </h4>
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-3 rounded-md border border-gray-200 flex-1 break-all text-sm">
                                {selectedCryptoDetails.deposit_address || selectedCryptoDetails.address}
                              </div>
                              <button 
                                onClick={() => copyToClipboard(selectedCryptoDetails.deposit_address || selectedCryptoDetails.address || "", "Crypto address")}
                                className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                              >
                                {copied === "Crypto address" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                              </button>
                            </div>
                            <div className="mt-2 flex items-center">
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Tap QR code</span> or <span className="font-medium">click copy button</span> to copy address
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  The deposit will be manually converted into fiat currency within 24 hours.
                                  After confirmation, the funds will be added to your account.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-sm text-gray-700">No cryptocurrency deposit options are available at this time. Please contact support for assistance.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 