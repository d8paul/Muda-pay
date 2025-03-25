"use client"

import { useState, useEffect } from "react"
import { get, post } from "@/utils/api"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Copy, CheckCircle, RefreshCw, QrCode, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QRCodeSVG } from "qrcode.react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface DepositResponse {
  status: number
  message: string
  data?: {
    // Bank response fields
    id?: number
    bank_name?: string
    account_name?: string
    account_number?: string
    swift_code?: string
    country?: string
    currency?: string
    reference_code?: string
    created_at?: string
    
    // Crypto response fields
    network?: string
    deposit_address?: string
  }
}

export default function DepositFloatTab() {
  const [isFormView, setIsFormView] = useState(true)
  const [depositType, setDepositType] = useState<"bank" | "stable">("bank")
  const [selectedCurrency, setSelectedCurrency] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [clientId, setClientId] = useState<string>("")
  const [depositResponse, setDepositResponse] = useState<DepositResponse | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get client ID when component mounts
  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId") || "";
    setClientId(storedClientId);
    
    if (!storedClientId) {
      console.warn("No clientId found in localStorage");
    }
  }, []);

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
          <div 
            className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg"
            style={{ width: size, height: size }}
          >
            <QrCode className="w-12 h-12 text-gray-500 mb-2" />
            <span className="text-sm text-gray-500 text-center px-2">QR Code for address</span>
            <span className="text-xs text-gray-400 mt-1 px-2 text-center break-all">{value.substring(0, 12)}...{value.substring(value.length - 8)}</span>
          </div>
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate the form
      if (!depositType) {
        throw new Error("Please select a deposit method");
      }

      if (!selectedCurrency) {
        throw new Error("Please select a currency");
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Send request to /payment/depositRequest endpoint with the correct parameters
      const response = await post("/payment/depositRequest", {
        from: depositType === "bank" ? "BANK" : "CRYPTO",
        to: "MUDA",
        currency: selectedCurrency,
        narration: `Deposit of ${selectedCurrency} ${amount} via ${depositType === "bank" ? "bank transfer" : "stable coin"}`,
        amount: Number(amount)
      });

      if (response.status === 200) {
        setDepositResponse(response);
        setIsFormView(false);
        toast.success("Deposit information retrieved successfully");
      } else {
        throw new Error(response.message || "Failed to process deposit request");
      }
    } catch (error: any) {
      console.error("Deposit request failed:", error);
      setError(error.message || "Failed to process deposit request");
      toast.error(error.message || "Failed to process deposit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsFormView(true);
    setDepositResponse(null);
    setSelectedCurrency("");
    setAmount("");
  };

  // Deposit form view
  const renderDepositForm = () => {
    return (
      <div className="space-y-6">
        <div className="border-b pb-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Deposit Funds</h3>
          <p className="mt-2 text-sm text-gray-500">
            Complete the form below to initiate a deposit to your account. Once submitted, you will receive the necessary 
            details to complete your transaction.
          </p>
        </div>

        <div className="bg-[#e6f4ff] border border-[#26a0ff33] rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-[#26a0ff]" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                For bank transfers, you will receive bank account details and a reference code. 
                For stable coins, you will receive a deposit address (and memo if required).
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Payment Method
              </label>
              <Tabs defaultValue={depositType} onValueChange={(value) => setDepositType(value as "bank" | "stable")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                  <TabsTrigger value="stable">Stable Coin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                {depositType === "bank" ? "Transfer Currency" : "Select Stable Coin"}
              </label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${depositType === "bank" ? "currency" : "stable coin"}`} />
                </SelectTrigger>
                <SelectContent>
                  {depositType === "bank" ? (
                    <>
                      <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                      <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="USDT">USDT - Tether</SelectItem>
                      <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                {depositType === "bank" 
                  ? "Select the currency you wish to deposit via bank transfer" 
                  : "Select the stable coin you wish to deposit"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Deposit Amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="any"
                required
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the amount you wish to deposit in {selectedCurrency || "the selected currency"}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Get Deposit Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // Result view for bank deposit
  const renderBankDepositResult = () => {
    const bankDetails = depositResponse?.data;
    
    if (!bankDetails || !bankDetails.bank_name || !bankDetails.account_number) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">Bank details not available. Please try again.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="border-b pb-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Bank Transfer Details</h3>
          <p className="mt-2 text-sm text-gray-500">
            Use these details to complete your bank transfer
          </p>
        </div>

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
                  {bankDetails.reference_code}
                  <button 
                    onClick={() => copyToClipboard(bankDetails.reference_code || "", "Reference")}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    {copied === "Reference" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleReset}>
            Make Another Deposit
          </Button>
        </div>
      </div>
    );
  };

  // Result view for stable coin deposit
  const renderStableCoinDepositResult = () => {
    const stableDetails = depositResponse?.data;
    
    if (!stableDetails || !stableDetails.deposit_address) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">Stable coin details not available. Please try again.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="border-b pb-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Stable Coin Deposit Details</h3>
          <p className="mt-2 text-sm text-gray-500">
            Use these details to complete your deposit
          </p>
        </div>

        <div className="bg-[#e6f4ff] border border-[#26a0ff33] rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-[#26a0ff]" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                Please ensure you send {stableDetails.currency || selectedCurrency} to the exact address provided. 
                Using an incorrect address may result in permanent loss of funds.
                {stableDetails.network && ` Make sure to use the ${stableDetails.network.toUpperCase()} network.`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <QRCodeWithFallback value={stableDetails.deposit_address} size={200} />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Tap to copy address
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                {stableDetails.currency || selectedCurrency} Deposit Address {stableDetails.network ? `(${stableDetails.network.toUpperCase()})` : ''}
              </h4>
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-md border border-gray-200 flex-1 break-all text-sm">
                  {stableDetails.deposit_address}
                </div>
                <button 
                  onClick={() => copyToClipboard(stableDetails.deposit_address || "", "Crypto address")}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                >
                  {copied === "Crypto address" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
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

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleReset}>
            Make Another Deposit
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {isFormView ? (
        renderDepositForm()
      ) : (
        <>
          {depositType === "bank" ? renderBankDepositResult() : renderStableCoinDepositResult()}
        </>
      )}
    </div>
  )
} 