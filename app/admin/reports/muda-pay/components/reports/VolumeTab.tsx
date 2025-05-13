"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { get } from "@/utils/stage_api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"

interface VolumeData {
  month: string
  volume: number
}

const VolumeTab: React.FC = () => {
  const [volumeData, setVolumeData] = useState<VolumeData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVolumeData = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await get("admin/reports/volume")
        console.log("Fetched volume data:", data.data)

        // Map API response to match the VolumeData interface
        const mappedData = data.data.map((item: any) => ({
          month: item.month,
          volume: item.volume,
        }))

        setVolumeData(mappedData)
      } catch (err) {
        setError("Failed to fetch volume data. Please try again later.")
        toast.error("Failed to fetch volume data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVolumeData()
  }, [])

  return (
    <Card>
      <ProgressBar isLoading={isLoading} />
      <CardHeader>
        <CardTitle>Volume Report</CardTitle>
        <CardDescription>Total transaction volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={volumeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" name="Volume" fill="#9b87f5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Volume (UGX)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volumeData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.volume.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default VolumeTab