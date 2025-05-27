"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { post } from "@/utils/api"
import toast from "react-hot-toast"
import BavaPayLogo from "./BavaPayLogo"
import ProgressBar from "./ProgressBar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFAToken, setTwoFAToken] = useState("")
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const response = await post("/clients/login", { email, password })
      console.log("Login response:", response)
      
      if (response.data["2fa_status"] === "active") {
        setShow2FAModal(true)
      } else {
        // If 2FA is not active, store credentials and redirect to settings
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user_email", email)
        
        if (response.data.environment) {
          localStorage.setItem("environment", response.data.environment)
        }
        
        if (response.data.business_name) {
          localStorage.setItem("business_name", response.data.business_name)
        }
        
        toast.success("Login successful")
        router.push("/dashboard/settings?tab=account")
      }
    } catch (error) {
      console.error("Login failed:", error)
      // The error toast is handled by the API interceptor
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async () => {
    setIsLoading(true)
    try {
      const response = await post("/clients/login/confirm", {
        email,
        password,
        token: twoFAToken
      })
      console.log("Login success:", response)

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user_email", email)
        
        if (response.data.environment) {
          localStorage.setItem("environment", response.data.environment)
        }
        
        if (response.data.business_name) {
          localStorage.setItem("business_name", response.data.business_name)
        }
        
        toast.success("Login successful")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("2FA verification failed:", error)
      toast.error("Invalid 2FA code")
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-[#26a0ff] hover:text-blue-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26a0ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Please check your Google Authenticator app and enter the code below
            </p>
            <input
              type="text"
              value={twoFAToken}
              onChange={(e) => setTwoFAToken(e.target.value)}
              placeholder="Enter 2FA code"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              onClick={handle2FASubmit}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26a0ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

