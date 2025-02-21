"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BanknotesIcon, UsersIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "@/utils/currency"
import ProgressBar from "@/components/ProgressBar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

// Hardcoded data for statistics
const statsData = [
  { name: "Total Revenue", value: 5000000, icon: BanknotesIcon, change: "+12%", trend: "up" },
  { name: "Active Users", value: 1250, icon: UsersIcon, change: "+5%", trend: "up" },
  { name: "New Signups", value: 30, icon: UsersIcon, change: "-2%", trend: "down" },
  { name: "Transaction Volume", value: 10000000, icon: BanknotesIcon, change: "+8%", trend: "up" },
]

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

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
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
                      {item.name.includes("Revenue") || item.name.includes("Volume")
                        ? formatCurrency(item.value, "UGX")
                        : item.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.trend === "up" ? (
                        <ArrowUpIcon className="inline h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="inline h-4 w-4 text-red-500" />
                      )}
                      {item.change} from last month
                    </p>
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

