"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import ProgressBar from "@/components/ProgressBar"

// Hardcoded users data
const usersData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Approver", isActive: true },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Checker", isActive: true },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Checker", isActive: false },
]

export default function UsersListPage() {
  const [users, setUsers] = useState(usersData)
  const [filter, setFilter] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(filter.toLowerCase()) || user.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const toggleUserStatus = (userId: number) => {
    setIsLoading(true)
    setTimeout(() => {
      setUsers(users.map((user) => (user.id === userId ? { ...user, isActive: !user.isActive } : user)))
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Users List</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Filter users..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="bg-white shadow sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Switch checked={user.isActive} onCheckedChange={() => toggleUserStatus(user.id)} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
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

