"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { put, get } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"

interface Rate {
  id: string
  status: "active" | "inactive" | "pending"
  base_currency: string
  quote_currency: string
  hasCrypto: boolean
  referencePrice: string | null
  markup: number
  markdown: number
}

interface CurrencyOption {
  asset_code: string
  currency: string
}

interface EditRateModalProps {
  open: boolean
  onClose: (option?: boolean) => void
  onSuccess: () => void
  rate: Rate | null
  fetchRates: () => Promise<void>
}

export default function EditRateModal({ open, onClose, onSuccess, rate, fetchRates }: EditRateModalProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"active" | "inactive" | "pending">("active")
  const [baseCurrency, setBaseCurrency] = useState("UGX")
  const [quoteCurrency, setQuoteCurrency] = useState("USDT")
  const [hasCrypto, setHasCrypto] = useState(false)
  const [referencePrice, setReferencePrice] = useState("")
  const [markup, setMarkup] = useState("0")
  const [markdown, setMarkdown] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [currencyOptions, setCurrencies] = useState<CurrencyOption[]>([])
  const [twoFactorStatus, setTwoFactorStatus] = useState<string | null>(null)

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

  useEffect(() => {
    if (rate) {
      setStatus(rate.status)
      setBaseCurrency(rate.base_currency)
      setQuoteCurrency(rate.quote_currency)
      setHasCrypto(rate.hasCrypto)
      setReferencePrice(rate.referencePrice || "")
      setMarkup(rate.markup.toString())
      setMarkdown(rate.markdown.toString())
    }
  }, [rate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rate) return

    const rateData = {
      referencePrice: referencePrice || "",
      markup: parseFloat(markup) || 0,
      markdown: parseFloat(markdown) || 0
    }

    await requireTwoFactorAuth(rateData, async (data: any, token?: string) => {
      try {
        const responseUpdate = await put(`/admin/pair/prices/${rate.id}`, { ...data, token })
        if (responseUpdate.status === 200) {
          setShow2FAModal(false)
          onSuccess()
          onClose(false)
          toast.success("Rate updated successfully")
          await fetchRates() // Refresh the rates list
        } else {
          setShow2FAModal(true)
          onClose(true)
        }
      } catch (error) {
        console.error("Error updating rate:", error)
        toast.error("Failed to update rate")
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

      
      <Dialog open={open} onOpenChange={() => onClose(true)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Rate</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency </Label>
                <p>{baseCurrency}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoteCurrency">Quote Currency</Label>
                <p>{quoteCurrency}</p>
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
                onValueChange={(value: "active" | "inactive" | "pending") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Rate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 