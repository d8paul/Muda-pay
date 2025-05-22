"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { post } from "@/utils/api"

export default function AddUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  })

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

    setIsLoading(true)
    try {
      // API call to add user
      await post("admin/users", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        user_role: formData.role,
      })

      toast.success("User added successfully")
      router.push("/admin/users/list")
    } catch (error) {
      toast.error("Failed to add user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
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
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approver">Approver</SelectItem>
                  <SelectItem value="verifier">Verifier</SelectItem>
                </SelectContent>
              </Select>
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