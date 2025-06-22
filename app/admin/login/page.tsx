"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { post } from "@/utils/api"
//import { post, get } from "@/utils/stage_api"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import BavaPayLogo from "@/components/BavaPayLogo"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import LoginTwoFactorAuthDialog from "@/components/LoginTwoFactorAuthDialog"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await post("/admin/login", { email, password }) 
      console.log("Login response:", response)
      
      if (response.data["2fa_status"] === "active") {
        setShow2FAModal(true)
      } else {
        // If 2FA is not active, redirect to settings page
        localStorage.setItem("token", response.data.token)
        toast.success("Login successful")
        router.push("/admin/settings")
      }
    } catch (error) {
      console.error("Login failed:", error)
      // Error toast is handled by the API interceptor
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (token: string) => {
    setIsLoading(true)
    try {
      // Call login/confirm endpoint with credentials and 2FA token
      const response = await post("/admin/login/confirm", {
        email,
        password,
        token
      })
      console.log("Login success:", response)

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token)
        toast.success("Login successful")
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("2FA verification failed:", error)
      // Error toast is handled by the API interceptor
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    placeholder="Enter your email address"
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
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26a0ff] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LoginTwoFactorAuthDialog 
        open={show2FAModal} 
        onOpenChange={setShow2FAModal} 
        onSubmit={handle2FASubmit} 
        isLoading={isLoading} 
      />
    </>
  )
}

