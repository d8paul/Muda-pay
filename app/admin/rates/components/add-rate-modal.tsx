"use client"

import { useState } from "react"
import { post } from "@/utils/api"
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

interface AddRateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddRateModal({ open, onClose, onSuccess }: AddRateModalProps) {
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [baseCurrency, setBaseCurrency] = useState("UGX")
  const [quoteCurrency, setQuoteCurrency] = useState("USDT")
  const [hasCrypto, setHasCrypto] = useState(false)
  const [referencePrice, setReferencePrice] = useState("")
  const [markup, setMarkup] = useState("0")
  const [markdown, setMarkdown] = useState("0")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await post("/admin/rates", {
        status,
        base_currency: baseCurrency,
        quote_currency: quoteCurrency,
        hasCrypto,
        referencePrice: referencePrice || null,
        markup: parseFloat(markup) || 0,
        markdown: parseFloat(markdown) || 0,
      })

      toast.success("Rate created successfully")
      onSuccess()
      // Reset form
      setStatus("active")
      setBaseCurrency("UGX")
      setQuoteCurrency("USDT")
      setHasCrypto(false)
      setReferencePrice("")
      setMarkup("0")
      setMarkdown("0")
    } catch (error) {
      console.error("Error creating rate:", error)
      toast.error("Failed to create rate")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Rate</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UGX">UGX</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="TZS">TZS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoteCurrency">Quote Currency</Label>
                <Select value={quoteCurrency} onValueChange={setQuoteCurrency} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quote currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
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

            {hasCrypto && (
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
            )}

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