"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { post } from "@/utils/api"
import toast from "react-hot-toast"
import BavaPayLogo from "./BavaPayLogo"
import ProgressBar from "./ProgressBar"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      // Call the password reset endpoint
      await post("/clients/oauth/resetPasswordRequest", { email })
      
      // Show success message
      setIsSuccess(true)
      toast.success("Password reset instructions sent to your email")
    } catch (error) {
      console.error("Password reset request failed:", error)
      // The error toast is handled by the API interceptor
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <BavaPayLogo className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSuccess ? "Check your email" : "Reset your password"}
          </h2>
          {isSuccess && (
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent password reset instructions to {email}
            </p>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isSuccess ? (
              <div className="space-y-6">
                <p className="text-sm text-gray-700">
                  Please check your email for the OTP code to reset your password. You will need this code on the next step.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26a0ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Continue to reset password
                  </button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-sm">
                    <Link href="/login" className="font-medium text-[#26a0ff] hover:text-blue-500">
                      Back to login
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} method="POST" action="#">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26a0ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending..." : "Send reset instructions"}
                  </button>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-sm">
                    <Link href="/login" className="font-medium text-[#26a0ff] hover:text-blue-500">
                      Back to login
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