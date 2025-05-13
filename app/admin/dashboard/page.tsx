"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BanknotesIcon, UsersIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "@/utils/currency"
import ProgressBar from "@/components/ProgressBar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { get } from "@/utils/api"

interface StatsItem {
  name: string
  value: number
  icon: React.ElementType
}

// Hardcoded data for bar chart
const barChartData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
]

// Hardcoded data for line chart
const lineChartData = [
  { name: "Week 1", users: 500 },
  { name: "Week 2", users: 600 },
  { name: "Week 3", users: 750 },
  { name: "Week 4", users: 800 },
  { name: "Week 5", users: 1000 },
  { name: "Week 6", users: 1200 },
]

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [statsData, setStatsData] = useState<StatsItem[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await get("admin/get-stats")
        const { data } = response

        const mappedStats: StatsItem[] = [
          { name: "Total Collections", value: data.collections, icon: BanknotesIcon },
          { name: "Total Payouts", value: data.payouts, icon: BanknotesIcon },
          { name: "Total Revenue", value: data.revenue, icon: BanknotesIcon },
          { name: "Total Transactions", value: data.transactions, icon: BanknotesIcon },
        ]

        setStatsData(mappedStats)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((item) => (
                <Card key={item.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {item.name.includes("Revenue") || item.name.includes("Collections") || item.name.includes("Payouts")
                        ? formatCurrency(item.value, "UGX")
                        : item.value.toLocaleString()}
                    </div>
                    
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}