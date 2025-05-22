"use client"

import { useState, useEffect } from "react"
import { get } from "@/utils/api"
import FeesReportTable from "@/app/admin/fees/components/FeesReportTable"
import ProgressBar from "@/components/ProgressBar"
import { Loader2 } from "lucide-react"

interface FeesTabProps {
  clientId?: string
}

const FeesTab = ({ clientId }: FeesTabProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [feesData, setFeesData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeesData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await get(`/admin/reports/rails/transactions/fees`)
        setFeesData(response.data)
      } catch (err) {
        console.error("Error fetching fees data:", err)
        setError("Failed to load fees data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeesData()
  }, [clientId])

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProgressBar isLoading={isLoading} />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Fetching fees transactions...</p>
        </div>
      ) : feesData ? (
        <FeesReportTable
          items={feesData.items || []}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}

export default FeesTab 