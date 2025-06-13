"use client"

import { useState, useEffect } from "react"
import { X, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { post, get } from "@/utils/api"
import toast from "react-hot-toast"
import Image from "next/image"

interface Asset {
  asset_id: number;
  type: 'coin' | 'fiat';
  service_id: number;
  country: string | null;
  country_code: string | null;
  asset_code: string;
  asset_name: string;
  chain: string;
  logo: string;
}

interface WithdrawPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawPanel({ isOpen, onClose }: WithdrawPanelProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSendAsset, setSelectedSendAsset] = useState<Asset | null>(null)
  const [selectedReceiveAsset, setSelectedReceiveAsset] = useState<Asset | null>(null)
  const [sendAmount, setSendAmount] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [quoteExpiry, setQuoteExpiry] = useState(53)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock balance
  const balance = "462.582500"

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quoteExpiry > 0) {
      timer = setInterval(() => {
        setQuoteExpiry(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quoteExpiry]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await get('https://api.muda.tech/v1/rail/accounts/getAssets');
        if (response.status === 200) {
          setAssets(response.data);
          // Set default assets
          const defaultSendAsset = response.data.find((asset: Asset) => 
            asset.type === 'coin' && ['USDC', 'USDT'].includes(asset.asset_code)
          );
          const defaultReceiveAsset = response.data.find((asset: Asset) => 
            asset.type === 'fiat'
          );
          setSelectedSendAsset(defaultSendAsset || null);
          setSelectedReceiveAsset(defaultReceiveAsset || null);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Filter assets by type
  const cryptoAssets = assets.filter(asset => asset.type === 'coin');
  const fiatAssets = assets.filter(asset => asset.type === 'fiat');

  const handleSendAmountChange = (value: string) => {
    setSendAmount(value)
    // Mock conversion rate: 0.998
    const converted = parseFloat(value) * 0.998
    setReceiveAmount(converted.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
        throw new Error("Please enter a valid amount")
      }

      const response = await post("/payment/sendRequest", {
        amount: Number(sendAmount),
        currency: "USDC",
        receiveCurrency: "USD",
        receiveAmount: Number(receiveAmount)
      })

      if (response.status === 200) {
        toast.success("Transfer request submitted successfully")
        onClose()
      } else {
        throw new Error(response.message || "Failed to process transfer request")
      }
    } catch (error: any) {
      console.error("Transfer request failed:", error)
      setError(error.message || "Failed to process transfer request")
      toast.error(error.message || "Failed to process transfer request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">SEND FUNDS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700">My account</h3>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Send Amount <span className="text-red-500">*</span>
                </label>
                <span className="text-sm text-gray-500">
                  Balance: {balance} <span className="text-blue-500">Max</span>
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => handleSendAmountChange(e.target.value)}
                  className="flex-1"
                  placeholder="0.00"
                />
                <Select 
                  value={selectedSendAsset?.asset_code || ''} 
                  onValueChange={(value) => {
                    const asset = cryptoAssets.find(a => a.asset_code === value);
                    setSelectedSendAsset(asset || null);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      {selectedSendAsset && (
                        <div className="flex items-center gap-2">
                          <Image 
                            src={selectedSendAsset.logo} 
                            alt={selectedSendAsset.asset_name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{selectedSendAsset.asset_code}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoAssets.map((asset) => (
                      <SelectItem key={asset.asset_id} value={asset.asset_code}>
                        <div className="flex items-center gap-2">
                          <Image 
                            src={asset.logo} 
                            alt={asset.asset_name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{asset.asset_code} ({asset.chain})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="flex justify-center my-4">
              <ArrowUpDown className="text-gray-400" />
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
                  className="flex-1 bg-gray-50"
                  placeholder="0.00"
                />
                <Select 
                  value={selectedReceiveAsset?.asset_code || ''}
                  onValueChange={(value) => {
                    const asset = fiatAssets.find(a => a.asset_code === value);
                    setSelectedReceiveAsset(asset || null);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      {selectedReceiveAsset && (
                        <div className="flex items-center gap-2">
                          <Image 
                            src={selectedReceiveAsset.logo} 
                            alt={selectedReceiveAsset.asset_name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{selectedReceiveAsset.asset_code}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fiatAssets.map((asset) => (
                      <SelectItem key={asset.asset_id} value={asset.asset_code}>
                        <div className="flex items-center gap-2">
                          {asset.logo && (
                            <Image 
                              src={asset.logo} 
                              alt={asset.asset_name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          <span>{asset.asset_code} - {asset.country}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {quoteExpiry > 0 && (
                <p className="mt-2 text-sm text-orange-500 text-center">
                  Quote Expires in {quoteExpiry} Secs
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                USD Recipient <span className="text-red-500">*</span>
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select USD Recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recipient1">Recipient 1</SelectItem>
                  <SelectItem value="recipient2">Recipient 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Payment Purpose <span className="text-red-500">*</span>
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business Payment</SelectItem>
                  <SelectItem value="personal">Personal Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Supporting Documents <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-gray-500"
                  title="Supporting documents help info"
                >
                  ?
                </button>
              </div>
              <button
                type="button"
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-sm text-purple-600 hover:text-purple-700 hover:border-gray-400 transition-colors"
              >
                Add New Document
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Reference (Optional)
              </label>
              <Input
                type="text"
                placeholder="Enter Reference (Optional)"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "SEND"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 