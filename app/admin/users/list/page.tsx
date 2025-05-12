"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import ProgressBar from "@/components/ProgressBar"
import Modal from "@/components/ui/modal" // Assuming you have a modal component
import EditUserPage from "./edit_user"
import { get } from "@/utils/stage_api"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersListPage() {
  interface User {
    id: number
    name: string
    email: string
    role: string
    isActive: boolean
  }

  interface UserStats {
    role: string
    count: number
  }
  
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [filter, setFilter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

  const fetchUsers = async () => {
    setIsLoading(true)
    setError("")
    try {
      const [usersData, statsData] = await Promise.all([
        get("/admin/users"),
        get("/admin/reports/users")
      ])
      
      console.log("Fetched users:", usersData.data)
      console.log("Fetched stats:", statsData.data)
  
      // Map API response to match the User interface
      const mappedUsers = usersData.data.map((user: any) => ({
        id: user.id,
        name: `${capitalize(user.first_name)} ${capitalize(user.last_name)}`,
        email: user.email,
        role: user.role,
        isActive: true, // Assuming all users are active by default
      }))
  
      setUsers(mappedUsers)
      setUserStats(statsData.data)
    } catch (err) {
      setError("Failed to fetch data. Please try again later.")
      toast.error("Failed to fetch data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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

  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedUserId(null)
  }

  const handleEditSuccess = () => {
    closeEditModal()
    fetchUsers() // Refresh the users list
  }

  return (
    <>
      {/* Loading Indicator */}
      <ProgressBar isLoading={isLoading} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Users List</h1>
          
          {/* User Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {userStats.map((stat) => (
              <Card key={stat.role}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {capitalize(stat.role)}s
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>

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
              {error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : filteredUsers.length === 0 && !isLoading ? (
                <div className="p-4 text-gray-500">No users found.</div>
              ) : (
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
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user.id)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUserId !== null && (
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
          <EditUserPage userId={selectedUserId} onSuccess={handleEditSuccess} />
        </Modal>
      )}
    </>
  )
}