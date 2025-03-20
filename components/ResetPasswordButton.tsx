"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog"

interface ResetPasswordButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ResetPasswordButton({ 
  className, 
  variant = "outline" 
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
      <ChangePasswordDialog 
        open={isOpen} 
        onOpenChange={setIsOpen} 
      />
    </>
  )
} 