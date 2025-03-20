"use client"

import { useState } from "react"
import { post } from "@/utils/api"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required"
    }
    
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await post("/clients/changepassword", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      })
      
      toast.success("Password changed successfully")
      onOpenChange(false)
      
      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setErrors({})
    } catch (error) {
      console.error("Password change failed:", error)
      // Error toast is handled by API interceptor
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-medium">
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={errors.currentPassword ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={errors.newPassword ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={errors.confirmNewPassword ? "border-red-500" : ""}
              disabled={isLoading}
            />
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
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 