"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import ProgressBar from "@/components/ProgressBar"
import Modal from "@/components/ui/modal" // Assuming you have a modal component
import EditUserPage from "./edit_user"
import { get } from "@/utils/api"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function UsersListPage() {
  interface User {
    id: number
    first_name: string
    last_name: string
    email: string
    role: string
    role_details: {
      id: string | null
      name: string | null
      details: string | null
      status: string | null
      access_rights: any[]
    }
    status: string
    updated_at: string
    created_at: string
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

  const fetchUsers = async () => {
    setIsLoading(true)
    setError("")
    try {
      const [usersData, statsData] = await Promise.all([
        get("/admin/users"),
        get("/admin/reports/users")
      ])
      
      if (usersData.status === 200) {
        setUsers(usersData.data)
      setUserStats(statsData.data)
      } else {
        throw new Error("Failed to fetch users")
      }
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
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(filter.toLowerCase()) || 
      user.email.toLowerCase().includes(filter.toLowerCase())
  )

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedUserId(null)
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedUser(null)
  }

  const handleEditSuccess = () => {
    closeEditModal()
    fetchUsers()
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
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewUser(user)}
                      >
                        <TableCell>{`${capitalize(user.first_name)} ${capitalize(user.last_name)}`}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role_details?.name || user.role}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditUser(user.id)
                            }}
                          >
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

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">
                  {`${capitalize(selectedUser.first_name)} ${capitalize(selectedUser.last_name)}`}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3">{selectedUser.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Role</Label>
                <div className="col-span-3">{selectedUser.role_details?.name || selectedUser.role}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedUser.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created</Label>
                <div className="col-span-3">{new Date(selectedUser.created_at).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Last Updated</Label>
                <div className="col-span-3">{new Date(selectedUser.updated_at).toLocaleString()}</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeViewModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}