"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { Switch } from "@/components/ui/switch"

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

  useEffect(() => {
    const storedCurrency = localStorage.getItem("selectedCurrency")
    if (storedCurrency) {
      setSelectedCurrency(JSON.parse(storedCurrency))
    }
  }, [])

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency)
    localStorage.setItem("selectedCurrency", JSON.stringify(currency))
    setIsCurrencyMenuOpen(false)
  }

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/login")
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
                onCheckedChange={setIsLiveEnvironment}
                aria-label="Toggle environment"
              />
              <span className={`text-sm ${isLiveEnvironment ? "font-medium" : "text-gray-500"}`}>Live</span>
            </div>
            <div className="relative inline-block text-left mr-4">
              <div>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                  id="currency-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                >
                  <Image
                    src={selectedCurrency.flag || "/placeholder.svg"}
                    alt={selectedCurrency.name}
                    width={20}
                    height={15}
                    className="mr-2"
                  />
                  {selectedCurrency.code}
                  <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {isCurrencyMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="currency-menu"
                >
                  <div className="py-1" role="none">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencyChange(currency)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                        role="menuitem"
                      >
                        <Image
                          src={currency.flag || "/placeholder.svg"}
                          alt={currency.name}
                          width={20}
                          height={15}
                          className="mr-2"
                        />
                        {currency.name} ({currency.code})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="ml-3 relative">
              <div>
                <button
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <Image
                    className="h-8 w-8 rounded-full"
                    src="/placeholder.svg"
                    alt="User avatar"
                    width={32}
                    height={32}
                  />
                </button>
              </div>
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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

