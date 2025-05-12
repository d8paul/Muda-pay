"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { get } from "@/utils/stage_api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"

interface UserData {
  month: string
  users: number
}

const UsersTab: React.FC = () => {
  const [userData, setUserData] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await get("admin/reports/user-growth")
        console.log("Fetched user growth data:", data.data)

        // Map API response to match the UserData interface
        const mappedData = data.data.map((item: any) => ({
          month: item.month,
          users: item.users,
        }))

        setUserData(mappedData)
      } catch (err) {
        setError("Failed to fetch user growth data. Please try again later.")
        toast.error("Failed to fetch user growth data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return (
    <Card>
      <ProgressBar isLoading={isLoading} />
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>Number of users over time</CardDescription>
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
                  data={userData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" name="Users" fill="#9b87f5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Number of Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.users.toLocaleString()}</TableCell>
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

export default UsersTab