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
  onClose: (option: any) => void
  rate: Rate
  onSuccess: () => void
  fetchRates: () => void
}

export default function ApprovalRateModal({ open, onClose, onSuccess, rate, fetchRates }: EditRateModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorStatus, setTwoFactorStatus] = useState<string | null>(null)

  if (!rate) return null

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

  const handleApprove = async () => {
    const approvalData = {
      status: "approved"
    }

    await requireTwoFactorAuth(approvalData, async (data: any, token?: string) => {
      try {
        const response = await put(`/admin/pair/prices/${rate.id}/add/approve`, { ...data, token })
        if (response.status === 200) {
          setShow2FAModal(false)
          onSuccess()
          onClose(false)
          toast.success("Rate approved successfully")
          await fetchRates()
        } else {
          setShow2FAModal(true)
          onClose(true)
        }
      } catch (error) {
        console.error("Error approving rate:", error)
        toast.error("Failed to approve rate")
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
            <DialogTitle>Approve Rate</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Currency</Label>
                <p>{rate.base_currency}</p>
              </div>

              <div className="space-y-2">
                <Label>Quote Currency</Label>
                <p>{rate.quote_currency}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reference Price</Label>
              <p>{rate.referencePrice || "N/A"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Markup (%)</Label>
                <p>{rate.markup}%</p>
              </div>

              <div className="space-y-2">
                <Label>Markdown (%)</Label>
                <p>{rate.markdown}%</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onClose(true)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                Approve Rate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 