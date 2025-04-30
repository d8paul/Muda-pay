"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog"
import { ChangePasswordDialogAdmin } from "@/components/ChangePasswordDialogAdmin"

interface ResetPasswordButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  account_type?: string
}

export function ResetPasswordButton({ 
  className, 
  variant = "outline",
  account_type, 
}: ResetPasswordButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className={className}
        variant={variant}
      >
        Reset Password
      </Button>
      {account_type === "admin" ? (
        <ChangePasswordDialogAdmin 
          open={isOpen} 
          onOpenChange={setIsOpen} 
        />
      ) : (
        <ChangePasswordDialog 
          open={isOpen} 
          onOpenChange={setIsOpen} 
        />
      )}
    </>
  )
}