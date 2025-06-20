"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { post, get, isValidationError, getValidationErrors } from "@/utils/api"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

interface Role {
  id: string
  name: string
}

export default function AddUserPage() {
  const router = useRouter()
  const [localLoading, setLocalLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rightsFilter, setRightsFilter] = useState("all")
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [twoFactorStatus, setTwoFactorStatus] = useState<string | null>(null)
  
  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      toast.success("User added successfully")
      router.push("/admin/users/list")
    },
    redirectOnMissing: true
  })

  const isLoading = localLoading || twoFALoading

  useEffect(() => {
    // Check 2FA status on page load
    const checkTwoFactorStatus = async () => {
      try {
        const response = await get("/admin/users/2fa/status")
        setTwoFactorStatus(response.data.status)
        
        if (response.data.status !== "active") {
          toast.error("Please enable Two-Factor Authentication before proceeding")
          router.push("/admin/settings")
        }
      } catch (error) {
        console.error("Error checking 2FA status:", error)
      }
    }
    
    checkTwoFactorStatus()
    fetchRoles()
  }, [])


  const fetchRoles = async () => {
    try {
      setLocalLoading(true)
      const response = await get("/admin/roles", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sort_by: sortField,
          sort_order: sortOrder,
          name: nameFilter || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          access_right: rightsFilter !== "all" ? rightsFilter : undefined,
        },
      })
      if (response && Array.isArray(response.data)) {
        setRoles(response.data)
        setFilteredRoles(response.data)
        setTotalItems(response.total || response.data.length)
      } else {
        console.error("Invalid response format:", response)
        toast.error(response.message || "Invalid response format from server")
        setRoles([])
        setFilteredRoles([])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast.error(
        typeof error === "string"
          ? error
          : error instanceof Error && error.message
          ? error.message
          : "Failed to fetch roles"
      )
      setRoles([])
      setFilteredRoles([])
    } finally {
      setLocalLoading(false)
    }
  }

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
      role: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      user_role: formData.role,
    }
    
    await requireTwoFactorAuth(userData, addUser)
  }
  
  const addUser = async (data: any, token?: string) => {
    setLocalLoading(true)
    setValidationErrors({}) // Clear previous validation errors
    
    try {
      // If token is provided, include it in the request
      const payload = token ? { ...data, token } : data
      await post("admin/users", payload)
      // Success is handled by the 2FA hook onSuccess callback
    } catch (error) {
      // Check if it's a validation error and handle field-specific errors
      if (isValidationError(error)) {
        const fieldErrors = getValidationErrors(error)
        setValidationErrors(fieldErrors)
      }
      // General error toast is automatically shown by the API interceptor
      throw error // Re-throw to let 2FA hook handle it
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={twoFALoading}
      />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add User</h1>
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
                className={validationErrors.first_name ? 'border-red-500' : ''}
                required
              />
              {validationErrors.first_name && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.first_name.join(', ')}
                </p>
              )}
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
                className={validationErrors.last_name ? 'border-red-500' : ''}
                required
              />
              {validationErrors.last_name && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.last_name.join(', ')}
                </p>
              )}
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
                className={validationErrors.email ? 'border-red-500' : ''}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.email.join(', ')}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.user_role && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.user_role.join(', ')}
                </p>
              )}
            </div>
            <div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding User..." : "Add User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
