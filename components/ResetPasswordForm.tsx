"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { post } from "@/utils/api"
import toast from "react-hot-toast"
import BavaPayLogo from "./BavaPayLogo"
import ProgressBar from "./ProgressBar"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    // Validate password strength
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    // Validate OTP
    if (!otp || otp.trim() === "") {
      toast.error("Please enter the OTP from your email")
      return
    }
    
    setIsLoading(true)
    try {
      // Call the password reset endpoint with the required parameters
      await post("/clients/oauth/resetPassword", { 
        email, 
        otp, 
        newPassword: password 
      })
      
      // Show success message
      setIsSuccess(true)
      toast.success("Your password has been reset successfully")
    } catch (error) {
      console.error("Password reset failed:", error)
      // The error toast is handled by the API interceptor
    } finally {
      setIsLoading(false)
    }
  }

  // If no email is provided in the URL, redirect to forgot password page
  useEffect(() => {
    if (!email) {
      toast.error("Missing email address")
      router.push("/forgot-password")
    }
  }, [email, router])

  if (!email) {
    return (
      <>
        <ProgressBar isLoading={true} />
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <BavaPayLogo className="mx-auto h-12 w-auto" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Redirecting...
            </h2>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <BavaPayLogo className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSuccess ? "Password Reset Successful" : "Set New Password"}
          </h2>
          {!isSuccess && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the OTP sent to {email}
            </p>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isSuccess ? (
              <div className="space-y-6">
                <p className="text-sm text-gray-700">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26a0ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to login
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} method="POST" action="#">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    OTP Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP from email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26a0ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-[#26a0ff] hover:text-blue-500">
                      Resend OTP
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 