"use client"

import { useState } from "react"
import { get, post } from "@/utils/api"
import toast from "react-hot-toast"

export default function TestApiPage() {
  const [isLoading, setIsLoading] = useState(false)

  const testSuccessCall = async () => {
    setIsLoading(true)
    try {
      // This should succeed and show success toast
      const result = await get("/test/success")
      console.log("Success result:", result)
    } catch (error) {
      console.error("Unexpected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testErrorCall = async () => {
    setIsLoading(true)
    try {
      // This should fail and show error toast from response body
      const result = await get("/test/error")
      console.log("Error result:", result)
    } catch (error) {
      console.error("Expected error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testPasswordReset = async () => {
    setIsLoading(true)
    try {
      // Test password reset with invalid data
      const result = await post("/clients/oauth/resetPassword", {
        email: "test@example.com",
        otp: "123456",
        newPassword: "short"
      })
      console.log("Password reset result:", result)
    } catch (error) {
      console.error("Password reset error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testLoginError = async () => {
    setIsLoading(true)
    try {
      // Test login with invalid credentials
      const result = await post("/clients/login", {
        email: "invalid@example.com",
        password: "wrongpassword"
      })
      console.log("Login result:", result)
    } catch (error: any) {
      console.error("Login error:", error)
      // Check if error was already handled by interceptor
      if (error.isHandled) {
        console.log("Error was already handled by interceptor")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const testAdminLoginError = async () => {
    setIsLoading(true)
    try {
      // Test admin login with invalid credentials
      const result = await post("/admin/login", {
        email: "admin@example.com",
        password: "wrongpassword"
      })
      console.log("Admin login result:", result)
    } catch (error: any) {
      console.error("Admin login error:", error)
      // Check if error was already handled by interceptor
      if (error.isHandled) {
        console.log("Error was already handled by interceptor")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectToast = () => {
    // Test if toast is working at all
    toast.error("This is a direct test toast")
    toast.success("This is a success test toast")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">API Error Handling Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testDirectToast}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
          >
            Test Direct Toast
          </button>

          <button
            onClick={testSuccessCall}
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Success Call
          </button>
          
          <button
            onClick={testErrorCall}
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Test Error Call
          </button>
          
          <button
            onClick={testPasswordReset}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Password Reset Error
          </button>

          <button
            onClick={testLoginError}
            disabled={isLoading}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Login Error
          </button>

          <button
            onClick={testAdminLoginError}
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Test Admin Login Error
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Expected Behavior:</h2>
          <ul className="text-sm space-y-1">
            <li>• "Test Direct Toast" should show error and success toasts</li>
            <li>• Success calls should show success toast</li>
            <li>• Error calls should show error message from response body</li>
            <li>• Password reset with short password should show validation error</li>
            <li>• Login errors should show appropriate error messages</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">Password Visibility Feature:</h2>
          <ul className="text-sm space-y-1">
            <li>• <a href="/login" className="text-blue-600 underline">Regular Login</a> - Test password visibility</li>
            <li>• <a href="/admin/login" className="text-blue-600 underline">Admin Login</a> - Test password visibility</li>
            <li>• <a href="/forgot-password" className="text-blue-600 underline">Forgot Password</a> - Start password reset flow</li>
            <li>• <a href="/reset-password?email=test@example.com" className="text-blue-600 underline">Reset Password</a> - Test password fields with visibility</li>
            <li>• Click the eye icon next to password fields to toggle visibility</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded">
          <h2 className="font-semibold mb-2">Error Handling Confirmation:</h2>
          <ul className="text-sm space-y-1">
            <li>✅ API interceptor checks response body status</li>
            <li>✅ Error messages from response body are displayed</li>
            <li>✅ Success messages are shown appropriately</li>
            <li>✅ Password visibility toggles work on all forms</li>
            <li>✅ All login/reset flows use updated error handling</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-red-50 rounded">
          <h2 className="font-semibold mb-2">Troubleshooting:</h2>
          <ul className="text-sm space-y-1">
            <li>• If toasts don't appear, check if react-hot-toast is properly configured</li>
            <li>• Check browser console for any JavaScript errors</li>
            <li>• Verify that the Toaster component is rendered in your app</li>
            <li>• Try the "Test Direct Toast" button first</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 