"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"

export default function AdminHeader() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const router = useRouter()
  const { user, loading } = useUser()

  console.log("User in header",user)

  const handleLogout = () => {
    // Clear session data
    localStorage.clear()
    sessionStorage.clear()

    // Redirect to admin login page
    router.push("/admin")
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Admin Management</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center gap-2">
                    <Image
                      className="h-8 w-8 rounded-full"
                      src="/placeholder.svg"
                      alt="Admin avatar"
                      width={32}
                      height={32}
                    />
                    {!loading && user && (
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.role_details?.name || user.role}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              </div>
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="truncate max-w-[200px]" title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
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