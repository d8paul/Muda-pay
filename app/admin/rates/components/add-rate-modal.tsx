"use client"

import { useEffect, useState } from "react"
import { get, post } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"

interface AddRateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddRateModal({ open, onClose, onSuccess }: AddRateModalProps) {
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [baseCurrency, setBaseCurrency] = useState("")
  const [quoteCurrency, setQuoteCurrency] = useState("")
  const [hasCrypto, setHasCrypto] = useState(false)
  const [referencePrice, setReferencePrice] = useState("")
  const [markup, setMarkup] = useState("0")
  const [markdown, setMarkdown] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [currencyOptions, setCurrencies] = useState<string[]>([])

  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit: originalHandle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: (token?: string) => {
      // onSuccess()
    },
    redirectOnMissing: true
  })

  const handle2FASubmit = async (token: string) => {
    await originalHandle2FASubmit(token)
  }

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await get("/clients/currencies")       
        setCurrencies(response.data)
      } catch (error) {
        console.error("Error fetching currencies:", error)
        toast.error("Failed to fetch currencies")
      }
    }
    fetchCurrencies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation: both currencies must be selected
    if (!baseCurrency || baseCurrency === "") {
      toast.error("Base currency is required.")
      setIsLoading(false)
      return
    }

    if (!quoteCurrency || quoteCurrency === "") {
      toast.error("Quote currency is required.")
      setIsLoading(false)
      return
    }

    const rateData = {
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
      hasCrypto: hasCrypto,
      referencePrice: referencePrice || "",
      markup: parseFloat(markup) || 0,
      markdown: parseFloat(markdown) || 0,
      status: status
    }

    await requireTwoFactorAuth(rateData, async (data: any, token?: string) => {
      try {
        const response = await post("/admin/pair/prices", { ...data, token })
        if (response.status === 201) {

          setShow2FAModal(false)
          toast.success("Pair Price Rate created successfully")
          onSuccess()
          
          // Reset form
          setStatus("active")
          setBaseCurrency("")
          setQuoteCurrency("")
          setHasCrypto(false)
          setReferencePrice("")
          setMarkup("0")
          setMarkdown("0")
        } else {
          // toast.error("Failed to create rate")
        }
      } catch (error) {
        console.error("Error creating rate:", error)
        // toast.error("Failed to create rate")
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />

      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={twoFALoading}
      />


      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Rate</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map(opt => (
                      <SelectItem key={opt.asset_code} value={opt.asset_code}>
                        {opt.asset_code} ({opt.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoteCurrency">Quote Currency</Label>
                <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quote currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map(opt => (
                      <SelectItem key={opt.asset_code} value={opt.asset_code}>
                        {opt.asset_code}({opt.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasCrypto"
                checked={hasCrypto}
                onCheckedChange={setHasCrypto}
              />
              <Label htmlFor="hasCrypto">Has Crypto</Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="referencePrice">Reference Price</Label>
                <Input
                  id="referencePrice"
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={referencePrice}
                  onChange={(e) => setReferencePrice(e.target.value)}
                  placeholder="Enter reference price"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="markup">Markup (%)</Label>
                <Input
                  id="markup"
                  type="number"
                  step="0.01"
                  min="0"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  placeholder="Enter markup percentage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="markdown">Markdown (%)</Label>
                <Input
                  id="markdown"
                  type="number"
                  step="0.01"
                  min="0"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Enter markdown percentage"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: "active" | "inactive") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Rate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 