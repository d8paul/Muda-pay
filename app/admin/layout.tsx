"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { UserProvider } from "@/contexts/UserContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      console.log("The Admin Tokens: ",token)
      if (!token && pathname !== "/admin") {
        router.push("/admin")
      } else if (token) {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (!isAuthenticated && pathname !== "/admin") {
    return null // or a loading spinner
  }

  if (pathname === "/admin") {
    return <>{children}</>
  }

  return (
    <UserProvider>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}

