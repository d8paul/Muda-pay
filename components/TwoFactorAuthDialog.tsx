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
import { LockIcon, ShieldCheckIcon } from "lucide-react"

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
  const [formattedToken, setFormattedToken] = useState("")
  const [error, setError] = useState(false)
  const [countdown, setCountdown] = useState(30)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTwoFAToken("")
      setFormattedToken("")
      setError(false)
      setCountdown(30)
    }
  }, [open])

  // Create countdown timer for token expiration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (open && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [open, countdown]);

  // Handle token input with formatting
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 6)
    setTwoFAToken(value)
    
    // Format with space after 3 digits
    if (value.length > 3) {
      setFormattedToken(`${value.substring(0, 3)} ${value.substring(3)}`)
    } else {
      setFormattedToken(value)
    }
    
    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      handleSubmit()
    }
    
    // Reset error state when typing
    if (error) setError(false)
  }

  const handleSubmit = () => {
    if (twoFAToken.length !== 6) {
      setError(true)
      return
    }
    onSubmit(twoFAToken)
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
          {countdown > 0 && (
            <div className="text-xs text-gray-500 flex items-center">
              <LockIcon className="h-3 w-3 mr-1" /> Code expires in {countdown}s
            </div>
          )}
          <div className="w-full">
            <Input
              type="text"
              value={formattedToken}
              onChange={handleTokenChange}
              placeholder="000 000"
              className={`text-center text-xl tracking-widest ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              autoFocus
              inputMode="numeric"
              maxLength={7} // 6 digits + 1 space
            />
            {error && (
              <p className="mt-1 text-xs text-red-500">Please enter a valid 6-digit code</p>
            )}
          </div>
          
          {countdown === 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                Time expired. Please request a new code or refresh the page.
              </AlertDescription>
            </Alert>
          )}
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
