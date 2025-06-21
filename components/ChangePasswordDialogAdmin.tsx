"use client"

import { useState } from "react"
import { put } from "@/utils/api"
import toast from "react-hot-toast"
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

interface ChangePasswordDialogAdminProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialogAdmin({
  open,
  onOpenChange,
}: ChangePasswordDialogAdminProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [localLoading, setLocalLoading] = useState(false)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmNewPassword?: string
  }>({})

  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      toast.success("Password changed successfully")
      onOpenChange(false)
      resetForm()
    },
    redirectOnMissing: false // Don't redirect, just show error
  })

  const isLoading = localLoading || twoFALoading

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
    }
    
    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = "Please confirm your new password"
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
    setErrors({})
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const passwordData = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmNewPassword
    }
    
    await requireTwoFactorAuth(passwordData, changePassword)
  }

  const changePassword = async (data: any, token?: string) => {
    setLocalLoading(true)
    
    try {
      // Add token to payload if provided
      const payload = token ? { ...data, token } : data
      
      await put("/admin/change-password", payload)
      // Success is handled by the 2FA hook onSuccess callback
    } catch (error: any) {
      console.error("Password change failed:", error)
      console.error("Error response:", error?.response)
      console.error("Error response data:", error?.response?.data)
      
      // Extract error message from API response
      let errorMessage = "Password change failed. Please try again."
      
      // Check for different error response structures
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data) {
        // Handle case where error data is a string
        errorMessage = typeof error.response.data === 'string' ? error.response.data : errorMessage
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      console.log("Final error message:", errorMessage)
      
      // Display the error message to the user
      toast.error(errorMessage)
      
      // For specific errors like "Current password is incorrect", don't throw 
      // so the dialog stays open for the user to correct the password
      if (error?.response?.status === 401 || errorMessage.toLowerCase().includes('current password')) {
        // Don't re-throw for authentication errors - let user try again
        return
      }
      
      // Re-throw other errors to let 2FA hook handle them
      throw error
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm()
        }
        onOpenChange(isOpen)
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password. New password must be at least 8 characters long. Two-factor authentication will be required to confirm the change.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className={`${errors.currentPassword ? "border-red-500" : ""} pr-10`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.current ? "Hide password" : "Show password"}
                >
                  {showPassword.current ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password (min 8 characters)"
                  className={`${errors.newPassword ? "border-red-500" : ""} pr-10`}
                  disabled={isLoading}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.new ? "Hide password" : "Show password"}
                >
                  {showPassword.new ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showPassword.confirm ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={`${errors.confirmNewPassword ? "border-red-500" : ""} pr-10`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                >
                  {showPassword.confirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword}</p>
              )}
            </div>
            
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue with 2FA"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog for Password Change */}
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={isLoading}
      />
    </>
  )
}