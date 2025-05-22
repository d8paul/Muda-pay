"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { get } from "@/utils/api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"

interface TradeData {
  id: number
  date: string
  volume: number
  cost: number
  spread: number
  profit: number
  currency: string
}

const ProfitTab: React.FC = () => {
  const [tradeData, setTradeData] = useState<TradeData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfitData = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await get("admin/reports/profit-on-trades")
        console.log("Fetched profit data:", data.data)

        // Map API response to match the TradeData interface
        const mappedData = data.data.map((trade: any) => ({
          id: trade.id,
          date: trade.date,
          volume: trade.volume,
          cost: trade.cost,
          spread: trade.spread,
          profit: trade.profit,
          currency: trade.currency,
        }))

        setTradeData(mappedData)
      } catch (err) {
        setError("Failed to fetch profit data. Please try again later.")
        toast.error("Failed to fetch profit data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfitData()
  }, [])

  return (
    <Card>
      <ProgressBar isLoading={isLoading} />
      <CardHeader>
        <CardTitle>Profit on Trades</CardTitle>
        <CardDescription>
          Detailed breakdown of trade volumes, costs, spreads, and profit
        </CardDescription>
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
                  data={tradeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" name="Volume" fill="#4A90E2" />
                  <Bar dataKey="profit" name="Profit" fill="#007AFF" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Volume (UGX)</TableHead>
                  <TableHead>Cost (UGX)</TableHead>
                  <TableHead>Spread (%)</TableHead>
                  <TableHead>Profit (UGX)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeData.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{trade.date}</TableCell>
                    <TableCell>{trade.volume.toLocaleString()}</TableCell>
                    <TableCell>{trade.cost.toLocaleString()}</TableCell>
                    <TableCell>{trade.spread}%</TableCell>
                    <TableCell>{trade.profit.toLocaleString()}</TableCell>
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

export default ProfitTab