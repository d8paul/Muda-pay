"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { get, post } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState([])
  const [filter, setFilter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", client_id: "" })
  const router = useRouter()

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    setIsLoading(true)
    try {
      const response = await get("/admin/clients")
      if (response.status === 200) {
        setBusinesses(response.data)
      }
    } catch (error) {
      console.error("Error fetching businesses:", error)
      toast.error("Failed to fetch businesses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLoginClick = (business) => {
    setSelectedBusiness(business)
    setFormData((prevData) => ({
      ...prevData,
      client_id: business.client_id,
    }))
    setIsModalOpen(true)
  }

  const handleViewUsersClick = (clientId) => {
    router.push(`/admin/business/businesslogins?client_id=${clientId}`)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      const response = await post("/admin/create-dashboard-login", formData)
      if (response.status === 201) {
        fetchBusinesses()
        toast.success("Login created successfully")
        setIsModalOpen(false)       
      } else {
        toast.error("Failed to create login")
      }
    } catch (error) {
      console.error("Error creating login:", error)
      toast.error("An error occurred")
    }
  }

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.business_name.toLowerCase().includes(filter.toLowerCase()) ||
      business.contact_email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Business List</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="mb-4">
              <Input type="text" placeholder="Filter businesses..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="bg-white shadow sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.client_id}>
                      <TableCell>{business.business_name}</TableCell>
                      <TableCell>{business.contact_email}</TableCell>
                      <TableCell>{business.phone_number}</TableCell>
                      <TableCell>{business.contact_person_name}</TableCell>
                      <TableCell>{business.registration_number}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleCreateLoginClick(business)}>
                          Create Logins
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleViewUsersClick(business.client_id)}
                        >
                          View Users
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

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dashboard Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
            <Input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
            <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
