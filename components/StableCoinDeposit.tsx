"use client"

import { useState, useEffect } from "react"
import { post } from "@/utils/api"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Copy, CheckCircle, RefreshCw, QrCode, ArrowRight } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StableCoinDepositProps {
  onReset?: () => void;
  showCurrencySelect?: boolean;
  defaultCurrency?: string;
  hideResetButton?: boolean;
}

interface DepositResponse {
  status: number
  message: string
  data?: {
    network?: string
    deposit_address?: string
    currency?: string
  }
}

// QR Code component with fallback
const QRCodeWithFallback = ({ value, size = 200, onCopy }: { value: string, size?: number, onCopy: (text: string, type: string) => void }) => {
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
          onClick={() => onCopy(value, "Crypto address")}
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

export default function StableCoinDeposit({ 
  onReset, 
  showCurrencySelect = true,
  defaultCurrency = "",
  hideResetButton = false
}: StableCoinDepositProps) {
  const [isFormView, setIsFormView] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [depositResponse, setDepositResponse] = useState<DepositResponse | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success(`${type} copied to clipboard`)
    setTimeout(() => setCopied(null), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedCurrency && showCurrencySelect) {
        throw new Error("Please select a stable coin");
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const response = await post("/payment/depositRequest", {
        from: "CRYPTO",
        to: "MUDA",
        currency: selectedCurrency || defaultCurrency,
        narration: `Deposit of ${selectedCurrency || defaultCurrency} ${amount} via stable coin`,
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
    setSelectedCurrency(defaultCurrency);
    setAmount("");
    if (onReset) onReset();
  };

  // Deposit form view
  const renderDepositForm = () => {
    return (
      <div className="space-y-6">
        <div className="border-b pb-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Stable Coin Deposit</h3>
          <p className="mt-2 text-sm text-gray-500">
            Complete the form below to get deposit address for your stable coin transfer.
          </p>
        </div>

        <div className="bg-[#e6f4ff] border border-[#26a0ff33] rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-[#26a0ff]" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                You will receive a deposit address for your selected stable coin. Please ensure you send the exact amount specified.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {showCurrencySelect && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Select Stable Coin
                </label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select stable coin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT - Tether</SelectItem>
                    <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
                Enter the amount you wish to deposit in {selectedCurrency || defaultCurrency}
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
                  Get Deposit Address
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
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
                Please ensure you send {stableDetails.currency || selectedCurrency || defaultCurrency} to the exact address provided. 
                Using an incorrect address may result in permanent loss of funds.
                {stableDetails.network && ` Make sure to use the ${stableDetails.network.toUpperCase()} network.`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <QRCodeWithFallback value={stableDetails.deposit_address} size={200} onCopy={copyToClipboard} />
            </div>
           
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                {stableDetails.currency || selectedCurrency || defaultCurrency} Deposit Address {stableDetails.network ? `(${stableDetails.network.toUpperCase()})` : ''}
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
            
           

          </div>
        </div>

        {!hideResetButton && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleReset}>
              Make Another Deposit
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {isFormView ? (
        renderDepositForm()
      ) : (
        renderStableCoinDepositResult()
      )}
    </div>
  )
} 