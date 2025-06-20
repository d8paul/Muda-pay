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
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { get } from "@/utils/api"
import FeesPageHeader from "@/components/admin/PageHeader"
import ProgressBar from "@/components/ui/progress-bar"
import ReportFilters from "../components/ReportFilters"
import ExportButton from "@/components/ui/export-button"
import { ExportField } from "@/utils/exportService"

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

// Helper function to get date ranges for presets
const getDateRangeForPreset = (preset: string): DateRange | undefined => {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  switch (preset) {
    case 'today':
      return {
        from: startOfToday,
        to: today
      }
    case 'last_week':
      return {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: today
      }
    case 'last_month':
      return {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: today
      }
    case 'last_3_months':
      return {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: today
      }
    case 'custom':
    default:
      return undefined
  }
}

export default function VolumeReport() {
  const [reports, setReports] = useState<VolumeReport[]>([])
  const [datePeriod, setDatePeriod] = useState<DatePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<VolumeReport | null>(null)
  const [filters, setFilters] = useState({
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      to: new Date(), // today
    } as DateRange,
    datePreset: "last_week",
    currency: "all",
  })

  const itemsPerPage = 10

  useEffect(() => {
    fetchReports()
  }, [filters.dateRange, filters.currency])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.dateRange?.from) {
        params.append('start_date', format(filters.dateRange.from, 'yyyy-MM-dd'))
      } else {
        params.append('start_date', 'null')
      }
      if (filters.dateRange?.to) {
        params.append('end_date', format(filters.dateRange.to, 'yyyy-MM-dd'))
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

  const handleDatePresetChange = (preset: string) => {
    const newDateRange = getDateRangeForPreset(preset)
    setFilters(prev => ({
      ...prev,
      datePreset: preset,
      dateRange: newDateRange || prev.dateRange
    }))
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <Select value={filters.datePreset} onValueChange={handleDatePresetChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Currency
                  </label>
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

              {/* Custom Date Range - Show only when custom is selected */}
              {filters.datePreset === 'custom' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Custom Date Range
                  </label>
                  <DatePickerWithRange
                    date={filters.dateRange}
                    onDateChange={(range: DateRange | undefined) => setFilters(prev => ({ ...prev, dateRange: range || prev.dateRange, datePreset: 'custom' }))}
                  />
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report, index) => (
                      <TableRow 
                        key={index}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedReport(report)}
                      >
                        <TableCell className="font-medium">{report.currency}</TableCell>
                        <TableCell>{parseFloat(report.pull_volume).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat(report.push_volume).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{parseFloat(report.total_movement).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Volume Report Details - {selectedReport?.currency}</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Currency</h4>
                    <p className="mt-1 text-lg font-medium">{selectedReport.currency}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Push Volume</h4>
                    <p className="mt-1">{parseFloat(selectedReport.push_volume).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Pull Volume</h4>
                    <p className="mt-1">{parseFloat(selectedReport.pull_volume).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Swap Volume</h4>
                    <p className="mt-1">{parseFloat(selectedReport.swap_volume).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Bank Deposit Volume</h4>
                    <p className="mt-1">{parseFloat(selectedReport.bank_deposit_volume).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Net Volume</h4>
                    <p className="mt-1 text-lg font-medium">{parseFloat(selectedReport.net_volume).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Movement</h4>
                    <p className="mt-1 text-lg font-medium">{parseFloat(selectedReport.total_movement).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Transaction Count</h4>
                    <p className="mt-1 text-lg font-medium">{selectedReport.transaction_count}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
} 