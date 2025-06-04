"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheckIcon } from "lucide-react"
import { post } from "@/utils/api"

interface TwoFactorAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (token: string) => void;
  isLoading: boolean;
}

export default function TwoFactorAuthDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: TwoFactorAuthDialogProps) {
  const [twoFAToken, setTwoFAToken] = useState("")
  const [error, setError] = useState(false)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTwoFAToken("")
      setError(false)
    }
  }, [open])

  // Handle token input
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 6)
    setTwoFAToken(value)
    setError(false) // Reset error state when typing
  }

  const verifyToken = async (token: string) => {
    if (token.length !== 6) {
      setError(true)
      return
    }

    try {
      const response = await post("/admin/users/2fa/verify/code", { token });
      // Check if the response indicates success
      if (response.data?.status === true) {
        onSubmit(token);
        onOpenChange(false); // Close the dialog on successful verification
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      setError(true);
    }
  }

  const handleSubmit = () => {
    verifyToken(twoFAToken)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold mt-4">Security Verification</DialogTitle>
          <p className="text-center text-sm text-gray-500">
            Please enter the 6-digit code from your authenticator app
          </p>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="w-full">
            <Input
              type="text"
              value={twoFAToken}
              onChange={handleTokenChange}
              placeholder="000000"
              className={`text-center text-xl tracking-widest ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              autoFocus
              inputMode="numeric"
              maxLength={6}
            />
            {error && (
              <p className="mt-1 text-xs text-red-500">Please enter a valid 6-digit code</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="default"
            onClick={handleSubmit}
            className="w-full"
            disabled={isLoading || twoFAToken.length !== 6}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
