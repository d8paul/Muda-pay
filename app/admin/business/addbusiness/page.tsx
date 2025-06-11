"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { post, get } from "@/utils/api"
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import { PhoneInput } from "@/components/ui/phone-input"

export default function AddBusinessPage() {
  const router = useRouter()
  const [localLoading, setLocalLoading] = useState(false)
  const [formData, setFormData] = useState({
    business_name: "",
    phone_number: "",
    address: "",
    contact_person_name: "",
    contact_email: "",
    contact_phone: ""
  })
  const [twoFactorStatus, setTwoFactorStatus] = useState<string | null>(null)
  
  const { 
    show2FAModal, 
    setShow2FAModal,
    isLoading: twoFALoading, 
    requireTwoFactorAuth,
    handle2FASubmit 
  } = useTwoFactorAuth({
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
          window.location.href = "/admin/settings"
        }
      } catch (error) {
        console.error("Error checking 2FA status:", error)
      }
    }
    
    checkTwoFactorStatus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await requireTwoFactorAuth(formData, createBusiness)
  }

  const createBusiness = async (data: any, token?: string) => {
    setLocalLoading(true)
    try {
      const payload = token ? { ...data, token } : data
      const response = await post("/admin/create-business", payload)
      if (response.status === 201) {
        toast.success("Business added successfully")
        setFormData({
          business_name: "",
          phone_number: "",
          address: "",
          contact_person_name: "",
          contact_email: "",
          contact_phone: ""
        })
        // Redirect to pending businesses page
        router.push("/admin/business/businesslist?tab=pending")
      } else {
        throw new Error("Failed to add business")
      }
    } catch (error) {
      console.error("Error adding business:", error)
      toast.error("Failed to add business")
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
          <h1 className="text-2xl font-semibold text-gray-900">Add Business</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Business</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Business Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Details</h3>
              <div>
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        type="text"
                        name="business_name"
                        id="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        placeholder="Enter business name"
                        required
                      />
              </div>

              <div>
                      <Label htmlFor="phone_number">Business Phone Number</Label>
                      <PhoneInput
                        name="phone_number"
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(value) => setFormData(prev => ({ ...prev, phone_number: value }))}
                        placeholder="Enter business phone number"
                        required
                      />
              </div>

              <div>
                      <Label htmlFor="address">Business Address</Label>
                      <Input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter business address"
                        required
                      />
              </div>
              </div>

                  <div className="border-t border-gray-200 my-6" />

                  {/* Contact Person Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Person Details</h3>
              <div>
                      <Label htmlFor="contact_person_name">Contact Person Name</Label>
                      <Input
                        type="text"
                        name="contact_person_name"
                        id="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleChange}
                        placeholder="Enter contact person's name"
                        required
                      />
              </div>

              <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        type="email"
                        name="contact_email"
                        id="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        placeholder="Enter contact person's email"
                        required
                      />
              </div>

              <div>
                      <Label htmlFor="contact_phone">Contact Phone</Label>
                      <PhoneInput
                        name="contact_phone"
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(value) => setFormData(prev => ({ ...prev, contact_phone: value }))}
                        placeholder="Enter contact person's phone number"
                        required
                      />
              </div>
              </div>

                  <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding Business..." : "Add Business"}
                </Button>
              </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
