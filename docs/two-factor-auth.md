# Two-Factor Authentication Usage Guide

This guide explains how to use the Two-Factor Authentication (2FA) dialog in the application.

## Components and Hooks

### TwoFactorAuthDialog Component

A reusable dialog component for 2FA verification.

**Props:**
- `open`: boolean - Controls dialog visibility
- `onOpenChange`: (open: boolean) => void - Handles visibility changes
- `onSubmit`: (token: string) => void - Callback function when token is submitted
- `isLoading`: boolean - Controls loading state

### useTwoFactorAuth Hook

A custom hook to manage 2FA verification flow.

**Usage:**

```tsx
const { 
  show2FAModal,           // Dialog visibility state
  setShow2FAModal,        // Function to control dialog visibility
  isLoading,              // Loading state
  requireTwoFactorAuth,   // Function to initiate 2FA verification
  handle2FASubmit         // Function to handle 2FA token submission
} = useTwoFactorAuth({
  onSuccess: () => {      // Optional callback when 2FA verification succeeds
    // Handle success
  },
  onError: (error) => {   // Optional callback when 2FA verification fails
    // Handle error
  }
})
```

## Implementation Examples

### 1. Basic Example with Form Submission

```tsx
// Import necessary dependencies
import { useState } from "react"
import { post } from "@/utils/api"
import toast from "react-hot-toast"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

export default function MyComponent() {
  // Form state
  const [formData, setFormData] = useState({
    // Your form fields
  })
  
  // Use the hook
  const { 
    show2FAModal, 
    setShow2FAModal, 
    isLoading, 
    requireTwoFactorAuth, 
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      toast.success("Operation successful")
      // Additional success handling
    }
  })

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data for the API
    const data = {
      // Format your form data for the API
    }
    
    // Initiate 2FA verification flow
    await requireTwoFactorAuth(data, performAction)
  }

  // Function that will be called after 2FA verification
  const performAction = async (data, token) => {
    try {
      // If token is provided, include it in the request
      const payload = token ? { ...data, token } : data
      
      // API call
      await post("/your-endpoint", payload)
    } catch (error) {
      console.error("Operation failed:", error)
      toast.error("Operation failed")
      throw error // Important to throw the error so the hook can handle it
    }
  }

  return (
    <>
      {/* Your component UI */}
      
      {/* 2FA dialog */}
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={isLoading}
      />
    </>
  )
}
```

## Security Best Practices

1. Always validate 2FA tokens on the server-side
2. Implement rate limiting for 2FA attempts
3. Set appropriate token expiration times
4. Provide clear error messages without exposing sensitive information
5. Consider implementing backup codes for account recovery
