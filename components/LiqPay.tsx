"use client"

import { useState, useEffect } from "react"
import { X, ArrowUpDown, Upload, Check, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { post, get } from "@/utils/api"
import toast from "react-hot-toast"
import Image from "next/image"
import { lrGet } from "@/utils/liquidityRailApi"
import { TransferData } from "./WithdrawPanel"
import { useRouter } from "next/navigation"
import AddPaymentMethod from "@/app/dashboard/settings/payment-methods/AddPaymentMethod"

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

interface PaymentMethod 
  {
      payment_method_id: string;
      company_id: string;
      kotani_customer_key: string;
      type: string;
      currency: string;
      phone_number: string;
      country_code: string;
      network: string;
      account_name: string;
      bank_name: string;
      bank_code: string;
      account_number: string;
      bank_address: string;
      bank_phone_number: string;
      bank_country: string;
      sort_code: string;
      swift_code: string;
  }


interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

interface WithdrawPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LiqPayProps {
  isOpen: boolean;
  onClose: () => void;
  balances?: Balance[];
}

interface Balance {
  balance: string;
  currency: string;
  asset_issuer: string;
  id: string;
  asset_code: string;
}

export default function LiqPay({ isOpen, onClose, balances = [] }: LiqPayProps) {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSendAsset, setSelectedSendAsset] = useState<Balance | null>(null)
  const [selectedReceiveAsset, setSelectedReceiveAsset] = useState<Asset | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [selectedPurpose, setSelectedPurpose] = useState<string>("")
  const [reference, setReference] = useState<string>("")
  const [sendAmount, setSendAmount] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [quoteExpiry, setQuoteExpiry] = useState(53)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState<string>("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const balance = balances.find(balances => balances.asset_code === selectedSendAsset?.asset_code)?.balance || "0.00"

  // Mock balance

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
    const fetchData = async () => {
      try {
        // Fetch assets
        const assetsResponse = await lrGet('/accounts/getAssets');
        if (assetsResponse.status === 200) {
          setAssets(assetsResponse.data);
          // Set default assets
          const defaultSendAsset = assetsResponse.data.find((asset: Asset) => 
            asset.type === 'coin' && ['USDC', 'USDT'].includes(asset.asset_code)
          );
          const defaultReceiveAsset = assetsResponse.data.find((asset: Asset) => 
            asset.type === 'fiat'
          );
          setSelectedReceiveAsset(defaultReceiveAsset || null);
        }

  
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!showAddDialog) {
    const fetchPaymentMethods = async () => {
      const paymentResponse:any = await lrGet('/accounts/getPaymentMethods');
        setPaymentMethods(paymentResponse.data);
      
      };
      fetchPaymentMethods();
    }
  }, [showAddDialog]);

  // Filter assets by type
  const cryptoAssets = assets.filter(asset => asset.type === 'coin');
  const fiatAssets = assets.filter(asset => asset.type === 'fiat');

  const handleSendAmountChange = (value: string) => {
    setSendAmount(value)
    // Mock conversion rate: 0.998
    const converted = parseFloat(value) * 0.998
    setReceiveAmount(converted.toString())
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.muda.tech/v1/rail/uploadfile', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const uploadedFile: UploadedFile = {
            name: file.name,
            url: result.fileUrl || result.url, // Handle different response formats
            size: file.size
          };
          setUploadedFiles(prev => [...prev, uploadedFile]);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    alert(selectedPaymentMethod)

    try {
      if (!sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (!selectedPaymentMethod) {
        throw new Error("Please select a payment method")
      }

      if (!selectedRecipient) {
        throw new Error("Please select a recipient")
      }

      if (!selectedPurpose) {
        throw new Error("Please select a payment purpose")
      }

      if (uploadedFiles.length === 0) {
        throw new Error("Please upload at least one supporting document")
      }

      const transferData: TransferData = {
        asset: selectedSendAsset?.asset_code || '',
        amount: sendAmount,
        to_address: receiveAmount,
        memo: reference || "LiqPay",
        trans_type: "LIQUIDITY_RAIL",
        clientId: "1",
        token: "1",
        payment_method_id: selectedPaymentMethod,
      }

      // Add file URLs and other data to the request
      const requestData = {
        ...transferData,
        recipient: selectedRecipient,
        purpose: selectedPurpose,
        reference: reference,
        supporting_documents: uploadedFiles.map(file => file.url),
        send_asset: selectedSendAsset?.asset_code,
        receive_asset: selectedReceiveAsset?.asset_code,
        send_amount: sendAmount,
        receive_amount: receiveAmount
      }

      const response = await post(`/transactions/admin/send-transaction`, requestData)

      if (response.status === 200) {
        setTransactionId(response.data?.transactionId || response.data?.id || 'N/A');
        setShowSuccess(true);
        toast.success("Transfer request submitted successfully")
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

  const handleReset = () => {
    setSendAmount("")
    setReceiveAmount("")
    setSelectedPaymentMethod("")
    setSelectedRecipient("")
    setSelectedPurpose("")
    setReference("")
    setUploadedFiles([])
    setError(null)
    setShowSuccess(false)
    setTransactionId("")
    setQuoteExpiry(53)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  if (loading) {
    return (
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}>
        <div className="h-full flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Success Page
  if (showSuccess) {
    return (
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}>
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Transfer Successful</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Transfer Submitted!
            </h3>
            
            <p className="text-gray-600 mb-4">
              Your transfer request has been successfully submitted and is being processed.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 w-full mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Transaction ID:</span>
                <span className="text-sm font-mono text-gray-900">{transactionId}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {sendAmount} {selectedSendAsset?.asset_code}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm text-yellow-600 font-medium">Processing</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              You will receive an email confirmation shortly. You can track the status of your transfer in the transactions section.
            </p>

            <Button
              onClick={handleClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
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
            onClick={handleClose}
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
                    const asset = balances.find(a => a.asset_code === value);
                    setSelectedSendAsset(asset || null);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      {balances && (
                        <div className="flex items-center gap-2">
                          <Image 
                            src={selectedSendAsset?.asset_code || ''} 
                            alt={selectedSendAsset?.asset_code || ''}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{selectedSendAsset?.asset_code}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {balances.map((asset) => (
                      <SelectItem key={asset.id} value={asset.asset_code}>
                        <div className="flex items-center gap-2">
                          <Image 
                              src={asset.asset_code} 
                            alt={asset.asset_code}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span>{asset.asset_code} ({asset.asset_issuer})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                Recipient <span className="text-red-500">*</span>
              </label>
       
            <div className="flex gap-2">
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select Recipient" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method:PaymentMethod) => (
                    <SelectItem key={method.payment_method_id} value={method.payment_method_id}>
 {method.account_name} {method.account_number} {method.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="px-4"
                onClick={() => {
                 setShowAddDialog(true)
                 // router.push('/dashboard/settings/payment-methods');
                }}
              >
                Add New
              </Button>
            </div>
            </div>
            <AddPaymentMethod showAddDialog={showAddDialog} setShowAddDialog={setShowAddDialog} />

           
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Payment Purpose <span className="text-red-500">*</span>
              </label>
              <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business Payment</SelectItem>
                  <SelectItem value="personal">Personal Transfer</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="remittance">Remittance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Supporting Documents <span className="text-red-500">*</span>
                </label>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800">{file.name}</span>
                          <span className="text-xs text-green-600">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Reference (Optional)
              </label>
              <Input
                type="text"
                placeholder="Enter Reference (Optional)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? "Processing..." : "SEND"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 