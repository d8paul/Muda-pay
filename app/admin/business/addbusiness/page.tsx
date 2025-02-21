"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { post } from "@/utils/api"

export default function AddBusinessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    phoneNumber: "",
    createdByName: "",
    createdByEmail: "",
    createdByPhone: "",
    registrationNumber: "",
    country: "",
    email: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await post("/admin/create-business", formData)
      if (response.status === 201) {
        toast.success("Business added successfully")
        setFormData({
          businessName: "",
          phoneNumber: "",
          createdByName: "",
          createdByEmail: "",
          createdByPhone: "",
          registrationNumber: "",
          country: "",
          email: "",
        })
      } else {
        toast.error("Failed to add business")
      }
    } catch (error) {
      console.error("Error adding business:", error)
      toast.error("Error adding business")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add Business</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input type="text" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input type="text" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="createdByName">Created By (Name)</Label>
                <Input type="text" name="createdByName" id="createdByName" value={formData.createdByName} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="createdByEmail">Created By (Email)</Label>
                <Input type="email" name="createdByEmail" id="createdByEmail" value={formData.createdByEmail} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="createdByPhone">Created By (Phone)</Label>
                <Input type="text" name="createdByPhone" id="createdByPhone" value={formData.createdByPhone} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input type="text" name="registrationNumber" id="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input type="text" name="country" id="country" value={formData.country} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="email">Business Email</Label>
                <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding Business..." : "Add Business"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
