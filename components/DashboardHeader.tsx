"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { Switch } from "@/components/ui/switch"
import { get, post } from "@/utils/api"
import { User } from "lucide-react"

interface Currency {
  code: string;
  name: string;
  flag: string;
}

const currencies = [
  { code: "UGX", name: "Ugandan Shilling", flag: "https://flagcdn.com/w40/ug.png" },
  { code: "KES", name: "Kenyan Shilling", flag: "https://flagcdn.com/w40/ke.png" },
  { code: "TZS", name: "Tanzanian Shilling", flag: "https://flagcdn.com/w40/tz.png" },
]

export default function DashboardHeader() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0])
  const router = useRouter()
  const [isLiveEnvironment, setIsLiveEnvironment] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [businessName, setBusinessName] = useState("")

  useEffect(() => {
    // Load currency preference
    const storedCurrency = localStorage.getItem("selectedCurrency")
    if (storedCurrency) {
      setSelectedCurrency(JSON.parse(storedCurrency))
    }
    
    // Load environment setting
    const environment = localStorage.getItem("environment")
    if (environment) {
      setIsLiveEnvironment(environment === "live")
    }
    
    // Load user info
    const email = localStorage.getItem("user_email")
    if (email) {
      setUserEmail(email)
    }
    
    const business = localStorage.getItem("business_name")
    if (business) {
      setBusinessName(business)
    }
  }, [])

  const handleToggleEnvironment = async () => {
    const currentStatus = isLiveEnvironment ? "live" : "test"
    const newStatus = !isLiveEnvironment ? "live" : "test"
  
    try {
      await post("clients/updateAccountStatus", { current_status: currentStatus, new_status: newStatus })
      setIsLiveEnvironment(!isLiveEnvironment)
      
      // Update stored environment
      localStorage.setItem("environment", newStatus)
      
      setFeedbackMessage("Environment updated successfully.")
    } catch (error) {
      console.error("Error updating environment status:", error)
      setFeedbackMessage("Failed to update environment.")
    } finally {
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 3000) // Hide feedback after 3 seconds
    }
  }

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency)
    localStorage.setItem("selectedCurrency", JSON.stringify(currency))
    setIsCurrencyMenuOpen(false)
  }

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("token")
    localStorage.removeItem("environment")
    localStorage.removeItem("business_name")
    localStorage.removeItem("user_email")
    
    router.push("/login")
  }

  // Function to get initials from business name or email
  const getInitials = () => {
    if (businessName) {
      return businessName
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    } else if (userEmail) {
      return userEmail.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  // Gets the environment badge color
  const getEnvironmentBadgeColor = () => {
    return isLiveEnvironment ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Payments and collections</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-2 mr-4">
              <span className={`text-sm ${isLiveEnvironment ? "text-gray-500" : "font-medium"}`}>Test</span>
              <Switch
                checked={isLiveEnvironment}
                onCheckedChange={handleToggleEnvironment}
                aria-label="Toggle environment"
              />
              <span className={`text-sm ${isLiveEnvironment ? "font-medium" : "text-gray-500"}`}>Live</span>
            </div>
            {showFeedback && (
              <div className="ml-4 text-sm text-gray-700">
                {feedbackMessage}
              </div>
            )}
            <div className="ml-3 relative">
              <div>
                <button
                  className="bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center">
                    <div className="mr-3 text-right hidden sm:block">
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${getEnvironmentBadgeColor()}`}>
                        {isLiveEnvironment ? "Live" : "Test"} Mode
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-sky-600 flex items-center justify-center text-white">
                      {getInitials()}
                    </div>
                  </div>
                </button>
              </div>
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-3 border-b border-gray-100">
                    {businessName && (
                      <p className="text-sm font-medium text-gray-700">{businessName}</p>
                    )}
                    {userEmail && (
                      <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    )}
                    <div className={`mt-1 text-xs font-medium px-2 inline-block py-0.5 rounded-full ${getEnvironmentBadgeColor()}`}>
                      {isLiveEnvironment ? "Live" : "Test"} Mode
                    </div>
                  </div>
                  <a
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Settings
                  </a>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

