"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { get } from "@/utils/api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"

interface Fee {
  id: number
  feeName: string
  feeAmount: number
  feeType: string
  applicableTo: string
  dateCreated: string
  totalCollected: number
}

interface FeesTabProps {
  clientId: string
}

const FeesTab = ({ clientId }: FeesTabProps) => {
  const [fees, setFees] = useState<Fee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState("month")

  useEffect(() => {
    const fetchFees = async () => {
      setIsLoading(true)
      try {
        const response = await get(`/admin/business/${clientId}/fees`)
        setFees(response.data)
      } catch (error) {
        console.error("Error fetching fees:", error)
        toast.error("Failed to fetch fees")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFees()
  }, [dateRange, clientId])

  const filteredFees = fees.filter(
    (fee) =>
      fee.feeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.applicableTo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by fee name or applicable to..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-[180px]">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fee Name</TableHead>
              <TableHead>Fee Amount</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Applicable To</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Total Collected (UGX)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No fees found
                </TableCell>
              </TableRow>
            ) : (
              filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>{fee.feeName}</TableCell>
                  <TableCell>
                    {fee.feeType === "Fixed" 
                      ? `${fee.feeAmount.toLocaleString()} UGX` 
                      : `${fee.feeAmount}%`
                    }
                  </TableCell>
                  <TableCell>{fee.feeType}</TableCell>
                  <TableCell>{fee.applicableTo}</TableCell>
                  <TableCell>{fee.dateCreated}</TableCell>
                  <TableCell>{fee.totalCollected.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default FeesTab 