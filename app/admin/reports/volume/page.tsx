"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePickerComponent as DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { get } from "@/utils/api"
import FeesPageHeader from "@/components/admin/PageHeader"
import ProgressBar from "@/components/ui/progress-bar"
import ReportFilters from "../components/ReportFilters"

interface VolumeReport {
  currency: string
  push_volume: string
  pull_volume: string
  swap_volume: string
  bank_deposit_volume: string
  net_volume: string
  total_movement: string
  transaction_count: number
}

interface DatePeriod {
  start: string
  end: string
  filter: string
}

interface VolumeReportResponse {
  status: number
  message: string
  data: {
    reports: VolumeReport[]
    datePeriod: DatePeriod
  }
}

export default function VolumeReport() {
  const [reports, setReports] = useState<VolumeReport[]>([])
  const [datePeriod, setDatePeriod] = useState<DatePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(), // today
    currency: "all",
  })

  const itemsPerPage = 10

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.startDate) {
        params.append('start_date', format(filters.startDate, 'yyyy-MM-dd'))
      } else {
        params.append('start_date', 'null')
      }
      if (filters.endDate) {
        params.append('end_date', format(filters.endDate, 'yyyy-MM-dd'))
      } else {
        params.append('end_date', 'null')
      }

      const data = await get(`/admin/reports/volume?${params.toString()}`)
      if (data.status !== 200) {
        throw new Error(data.message || 'Failed to fetch volume reports')
      }
      setReports(data.data.reports)
      setDatePeriod(data.data.datePeriod)
    } catch (error) {
      console.error("Error fetching volume reports:", error)
      setError(error instanceof Error ? error.message : 'Failed to fetch volume reports')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Get unique currencies from reports for filter dropdown
  const availableCurrencies = Array.from(new Set(reports.map(report => report.currency)))

  // Filter reports based on currency selection
  const filteredReports = filters.currency === "all" 
    ? reports 
    : reports.filter(report => report.currency === filters.currency)

  return (
    <>
      <ProgressBar isLoading={loading} />
      <div className="py-6">
        <FeesPageHeader 
          title="Volume Reports" 
          description="View and analyze transaction volume data" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Volume Report</h2>
              {datePeriod && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Data Period: {format(new Date(datePeriod.start), "MMM dd, yyyy")} - {format(new Date(datePeriod.end), "MMM dd, yyyy")}</p>
                  <p>Filter Type: {datePeriod.filter}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date: Date | null) => handleFilterChange("startDate", date)}
                  placeholderText="Start Date"
                />

                <DatePicker
                  selected={filters.endDate}
                  onChange={(date: Date | null) => handleFilterChange("endDate", date)}
                  placeholderText="End Date"
                />

                <Select
                  value={filters.currency}
                  onValueChange={(value) => handleFilterChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currencies</SelectItem>
                    {availableCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Push Volume</TableHead>
                    <TableHead>Pull Volume</TableHead>
                    <TableHead>Swap Volume</TableHead>
                    <TableHead>Bank Deposit Volume</TableHead>
                    <TableHead>Net Volume</TableHead>
                    <TableHead>Total Movement</TableHead>
                    <TableHead>Transaction Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{report.currency}</TableCell>
                        <TableCell>{parseFloat(report.push_volume).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat(report.pull_volume).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat(report.swap_volume).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat(report.bank_deposit_volume).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{parseFloat(report.net_volume).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{parseFloat(report.total_movement).toLocaleString()}</TableCell>
                        <TableCell className="text-center">{report.transaction_count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 