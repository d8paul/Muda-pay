"use client"

import { useState, useEffect } from "react"
import { ResetPasswordButton } from "@/components/ResetPasswordButton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { get, post, put } from "@/utils/api"
import toast from "react-hot-toast"
import { Card } from "@/components/ui/card"

export default function AccountTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [show2FABanner, setShow2FABanner] = useState(false)

  const checkTwoFactorStatus = async () => {
    try {
      const response = await get("/clients/users/2fa/status")
      const isEnabled = response.data.status === "active"
      setTwoFactorEnabled(isEnabled)
      setShow2FABanner(!isEnabled)
    } catch (error) {
      console.error("Error checking 2FA status:", error)
    }
  }

  useEffect(() => {
    checkTwoFactorStatus()
  }, [])

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (checked && !twoFactorEnabled) {
      // Enable 2FA
      try {
        setIsLoading(true)
        const response = await get("/clients/users/2fa/code")
        setQrCodeUrl(response.data.url)
        setShowQRCode(true)
      } catch (error) {
        console.error("Error initializing 2FA:", error)
        setTwoFactorEnabled(false)
      } finally {
        setIsLoading(false)
      }
    } else if (!checked && twoFactorEnabled) {
      // Disable 2FA
      try {
        setIsLoading(true)
        await put("/clients/users/2fa/update", {
          two_fa_token: "",
          status: "inactive"
        })
        toast.success("Two-factor authentication disabled")
        setTwoFactorEnabled(false)
        setShowQRCode(false)
      } catch (error) {
        console.error("Error disabling 2FA:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code")
      return
    }

    try {
      setIsLoading(true)
      await post("/clients/users/2fa/verify/code", { token: verificationCode })
      // Update 2FA status after successful verification
      await put("/clients/users/2fa/update", {
        two_fa_token: verificationCode,
        status: "active"
      })
      setShow2FABanner(false)
      toast.success("Two-factor authentication enabled")
      setTwoFactorEnabled(true)
      setShowQRCode(false)
      setVerificationCode("")
    } catch (error) {
      console.error("Error verifying 2FA:", error)
      toast.error("Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {show2FABanner && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please set up Two-Factor Authentication (2FA) with Google Authenticator for enhanced security.
                <button
                  onClick={() => setShow2FABanner(false)}
                  className="ml-2 text-yellow-700 hover:text-yellow-900 font-medium underline"
                >
                  Dismiss
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Section */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Password Management</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Update your password to maintain account security.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <p className="mb-4 text-sm text-gray-600">
            We recommend using a strong password that you don't use elsewhere and updating it periodically for better security.
          </p>
          <ResetPasswordButton 
            variant="default"
            className="bg-sky-500 hover:bg-sky-600"
          />
        </div>
      </Card>

      {/* Two-Factor Authentication Section */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Two-Factor Authentication</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Add an extra layer of security to your account with 2FA.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Two-factor authentication adds an additional layer of security by requiring a verification code along with your password when signing in.
            </p>
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-md border border-gray-200">
              <Switch 
                id="two-factor" 
                checked={twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                disabled={isLoading || showQRCode}
                className="data-[state=checked]:bg-sky-500"
              />
              <Label htmlFor="two-factor" className="font-medium">
                {twoFactorEnabled ? "Two-factor authentication is enabled" : "Two-factor authentication is disabled"}
              </Label>
            </div>
          </div>

          {showQRCode && (
            <div className="mt-6 p-6 border rounded-md bg-white shadow-sm">
              <h4 className="text-base font-medium text-gray-900 mb-2">Set Up Two-Factor Authentication</h4>
              <ol className="text-sm text-gray-600 mb-6 space-y-2 list-decimal pl-5">
                <li>Download an authenticator app like Google Authenticator or Authy</li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the 6-digit verification code from the app</li>
              </ol>
              
              <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-md">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              </div>
              
              <div className="mb-6">
                <Label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </Label>
                <input
                  type="text"
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  onClick={handleVerify2FA}
                  disabled={isLoading}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  {isLoading ? "Verifying..." : "Verify and Enable"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowQRCode(false)
                    setVerificationCode("")
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {twoFactorEnabled && !showQRCode && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              Two-factor authentication is currently enabled for your account, providing an additional layer of security.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 