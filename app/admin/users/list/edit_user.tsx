"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { get, put } from "@/utils/api"

interface EditUserPageProps {
  userId: number
  onSuccess?: () => void
}

export default function EditUserPage({ userId, onSuccess }: EditUserPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    user_role: "",
    status: "active",
    reset_password: false
  })

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const response = await get(`/admin/users/${userId}`)
        const userData = response.data
        
        setFormData({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || "",
          user_role: userData.user_role || "",
          status: userData.status || "active",
          reset_password: false
        })
      } catch (error) {
        toast.error("Failed to fetch user data")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchRoles = async () => {
      try {
        const response = await get("/admin/roles")
        if (response.data && Array.isArray(response.data)) {
          setRoles(response.data)
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          setRoles(response.data.items)
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error)
        toast.error("Failed to fetch roles")
        setRoles([])
      }
    }

    fetchUserData()
    fetchRoles()
  }, [userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      user_role: value,
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      status: value,
    }))
  }

  const handleResetPasswordChange = (checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      reset_password: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      // API call to edit user
      await put(`/admin/users/${userId}`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_role: formData.user_role,
        status: formData.status,
        reset_password: formData.reset_password
      })

      toast.success("User updated successfully")
      // Call the onSuccess callback if provided
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to update user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="user_role">Role</Label>
              <Select onValueChange={handleRoleChange} value={formData.user_role}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name || role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={handleStatusChange} value={formData.status}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="reset_password"
                checked={formData.reset_password}
                onCheckedChange={handleResetPasswordChange}
              />
              <Label htmlFor="reset_password">Reset Password</Label>
            </div>
            <div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating User..." : "Update User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}