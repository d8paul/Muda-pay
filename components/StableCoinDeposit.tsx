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

interface DepositData {
  id: number;
  currency: string;
  network: string;
  deposit_address: string;
  client_id: string;
  tag: string;
  vault_id: string;
  created_at: string;
}

interface DepositResponse {
  status: number;
  message: string;
  data: DepositData[];
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
  const [allDeposits, setAllDeposits] = useState<DepositData[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("all")
  const [copied, setCopied] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success(`${type} copied to clipboard`)
    setTimeout(() => setCopied(null), 3000)
  }

  // Fetch existing deposit requests on component mount
  useEffect(() => {
    const fetchDepositRequests = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await post("/payment/depositRequest", {
          from: "CRYPTO",
          to: "MUDA",
          currency: "USDT",
          narration: "Deposit of USDT via stable coin",
          amount: 400
        });

        if (response.status === 200) {
          // Handle array response
          if (Array.isArray(response.data)) {
            setAllDeposits(response.data);
          } else if (response.data) {
            // Handle single object response
            setAllDeposits([response.data]);
          } else {
            throw new Error("No deposit data available");
          }
          toast.success("Deposit information loaded successfully");
        } else {
          throw new Error(response.message || "Failed to fetch deposit requests");
        }
      } catch (error: any) {
        console.error("Failed to fetch deposit requests:", error);
        setError(error.message || "Failed to fetch deposit requests");
        toast.error(error.message || "Failed to fetch deposit requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepositRequests();
  }, []);

  // Get unique networks and currencies from the data
  const getUniqueNetworks = () => {
    const networks = allDeposits.map(deposit => deposit.network);
    return [...new Set(networks)];
  };

  const getUniqueCurrencies = () => {
    const currencies = allDeposits.map(deposit => deposit.currency);
    return [...new Set(currencies)];
  };

  // Filter deposits based on selected network and currency
  const getFilteredDeposits = () => {
    return allDeposits.filter(deposit => {
      const networkMatch = selectedNetwork === "all" || deposit.network === selectedNetwork;
      const currencyMatch = selectedCurrency === "all" || deposit.currency === selectedCurrency;
      return networkMatch && currencyMatch;
    });
  };

  const handleRefresh = () => {
    // Re-fetch deposit data
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Stable Coin Deposit</h3>
          <p className="mt-2 text-sm text-gray-500">
            Loading your deposit information...
          </p>
        </div>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading deposit details...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Stable Coin Deposit</h3>
          <p className="mt-2 text-sm text-gray-500">
            Failed to load deposit information
          </p>
        </div>
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
        <div className="flex justify-end">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const filteredDeposits = getFilteredDeposits();

  // Main view for stable coin deposits
  const renderDepositView = () => {
    return (
      <div className="space-y-6">
        <div className="border-b pb-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Stable Coin Deposit</h3>
          <p className="mt-2 text-sm text-gray-500">
            Select network and currency to view deposit addresses
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Select Network
            </label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                {getUniqueNetworks().map((network) => (
                  <SelectItem key={network} value={network}>
                    {network.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Select Currency
            </label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                {getUniqueCurrencies().map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deposit Results */}
        {filteredDeposits.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No deposits found for the selected filters. Try selecting different network or currency options.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDeposits.map((deposit) => (
              <Card key={deposit.id} className="p-6">
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      {deposit.currency} - {deposit.network.toUpperCase()}
                    </h4>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(deposit.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-[#e6f4ff] border border-[#26a0ff33] rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-[#26a0ff]" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        Please ensure you send {deposit.currency} to the exact address provided. 
                        Using an incorrect address may result in permanent loss of funds.
                        Make sure to use the {deposit.network.toUpperCase()} network.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <QRCodeWithFallback 
                        value={deposit.deposit_address} 
                        size={200} 
                        onCopy={copyToClipboard} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        {deposit.currency} Deposit Address ({deposit.network.toUpperCase()})
                      </h4>
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-3 rounded-md border border-gray-200 flex-1 break-all text-sm">
                          {deposit.deposit_address}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(deposit.deposit_address, `${deposit.currency} address`)}
                          className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                        >
                          {copied === `${deposit.currency} address` ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <Copy className="h-5 w-5" />
                          }
                        </button>
                      </div>
                    </div>

                    {deposit.tag && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Memo/Tag
                        </h4>
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-3 rounded-md border border-gray-200 flex-1 break-all text-sm">
                            {deposit.tag}
                          </div>
                          <button 
                            onClick={() => copyToClipboard(deposit.tag, "Memo/Tag")}
                            className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                          >
                            {copied === "Memo/Tag" ? 
                              <CheckCircle className="h-5 w-5 text-green-500" /> : 
                              <Copy className="h-5 w-5" />
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!hideResetButton && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderDepositView()}
    </div>
  )
} 