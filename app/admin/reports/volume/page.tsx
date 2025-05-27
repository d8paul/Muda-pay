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
  id: number
  client_id: string
  validation_id: string
  product_id: string
  trans_type: string
  trans_id: string
  reference_id: string
  stellar_tx_id: string | null
  amount: string
  asset_code: string
  currency: string
  sender_account: string
  receiver_account: string
  memo: string
  status: string
  created_at: string
}

interface VolumeReportResponse {
  status: number
  message: string
  data: VolumeReport[]
}

export default function VolumeReport() {
  const [reports, setReports] = useState<VolumeReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    transType: "all",
    status: "all",
    startDate: null as Date | null,
    endDate: null as Date | null,
    search: "",
  })

  const itemsPerPage = 10

  useEffect(() => {
    fetchReports()
  }, [currentPage, filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await get("/admin/reports/volume")
      if (data.status !== 200) {
        throw new Error(data.message || 'Failed to fetch volume reports')
      }
      setReports(data.data)
      setTotalPages(Math.ceil(data.data.length / itemsPerPage))
    } catch (error) {
      console.error("Error fetching volume reports:", error)
      setError(error instanceof Error ? error.message : 'Failed to fetch volume reports')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange("search", e.target.value)
  }

  const filteredReports = reports.filter((report) => {
    return (
      (filters.transType === "all" || report.trans_type === filters.transType) &&
      (filters.status === "all" || report.status === filters.status) &&
      (!filters.search ||
        report.trans_id.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.reference_id.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.client_id.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.startDate ||
        new Date(report.created_at) >= filters.startDate) &&
      (!filters.endDate ||
        new Date(report.created_at) <= filters.endDate)
    )
  })

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <Select
                  value={filters.transType}
                  onValueChange={(value) => handleFilterChange("transType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PULL">Pull</SelectItem>
                    <SelectItem value="PUSH">Push</SelectItem>
                    <SelectItem value="SWAP">Swap</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>

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

                <Input
                  placeholder="Search by ID or Reference"
                  value={filters.search}
                  onChange={handleSearch}
                  className="md:col-span-4"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Client ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : paginatedReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {format(new Date(report.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>{report.trans_type}</TableCell>
                        <TableCell>{parseFloat(report.amount).toLocaleString()}</TableCell>
                        <TableCell>{report.currency}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              report.status === "SUCCESS"
                                ? "bg-green-100 text-green-800"
                                : report.status === "FAILED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {report.status}
                          </span>
                        </TableCell>
                        <TableCell>{report.asset_code}</TableCell>
                        <TableCell>{report.client_id}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 