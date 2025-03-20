"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DepositPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new deposit location in settings
    router.push("/dashboard/settings?tab=deposit")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Redirecting...</h2>
        <p className="mt-2 text-sm text-gray-500">
          The deposit page has moved to Settings &gt; Deposit Float
        </p>
      </div>
    </div>
  )
} 