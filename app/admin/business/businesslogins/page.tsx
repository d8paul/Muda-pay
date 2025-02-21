"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { get } from "@/utils/api"

export default function BusinessLoginsPage() {
  const [logins, setLogins] = useState([])
  const [filter, setFilter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const clientId = searchParams.get("client_id")

  useEffect(() => {
    fetchLogins()
  }, [])

  const fetchLogins = async () => {
    setIsLoading(true)
    try {
      const response = await get(`/admin/access-clients/${clientId}`)
      if (response.status === 200) {
        setLogins(response.data)
      }
    } catch (error) {
      console.error("Error fetching logins:", error)
      toast.error("Failed to fetch logins")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogins = logins.filter(
    (login) =>
      login.first_name.toLowerCase().includes(filter.toLowerCase()) ||
      login.email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Business Logins</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="mb-4">
              <Input type="text" placeholder="Filter logins..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="bg-white shadow sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogins.map((login) => (
                    <TableRow key={login.id}>
                      <TableCell>{login.first_name}</TableCell>
                      <TableCell>{login.last_name}</TableCell>
                      <TableCell>{login.email}</TableCell>
                      <TableCell>{login.role}</TableCell>
                      <TableCell>{new Date(login.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Disable
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
