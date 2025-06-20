"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { get, post } from "@/utils/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { UserPlusIcon, UsersIcon, CurrencyDollarIcon, MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, XCircleIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline"
import { X } from "lucide-react"
import PendingCompanies from "./PendingCompanies"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface Business {
  id: number
  client_id: string
  contact_email: string
  business_name: string
  phone_number: string
  country: string | null
  city: string | null
  address: string
  industry: string | null
  status: string
  registration_number: string | null
  contact_person_name: string
  contact_phone: string
  created_at: string
  environment: string
}

interface BusinessStats {
  collections: number
  payouts: number
  revenue: number
  transactions: number
  businesses: number
  businessInactiveCount: number
  businessApprovedCount: number
  businessRejectedCount: number
  businessPendingCount: number
}

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessStats, setBusinessStats] = useState<BusinessStats | null>(null)
  const [filter, setFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [regFilter, setRegFilter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", client_id: "" })
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get the tab parameter from URL, default to "all"
  const defaultTab = searchParams.get("tab") || "all"
  const [currentTab, setCurrentTab] = useState(defaultTab)

  useEffect(() => {
    fetchBusinesses()
    fetchBusinessStats()
  }, [])

  const fetchBusinesses = async () => {
    setIsLoading(true)
    try {
      const response = await get("/admin/clients")
      if (response.status === 200 && Array.isArray(response.data)) {
        setBusinesses(response.data)
      } else {
        setBusinesses([])
      }
    } catch (error) {
      console.error("Error fetching businesses:", error)
      toast.error("Failed to fetch businesses")
      setBusinesses([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBusinessStats = async () => {
    try {
      const response = await get("/admin/get-stats")
      if (response.status === 200 && response.data) {
        setBusinessStats(response.data)
      }
    } catch (error) {
      console.error("Error fetching business stats:", error)
      // Don't show error toast for stats as it's not critical
    }
  }

  const handleCreateLoginClick = (business: Business) => {
    setSelectedBusiness(business)
    setFormData((prevData) => ({
      ...prevData,
      client_id: business.client_id,
    }))
    setIsModalOpen(true)
  }

  const handleViewUsersClick = (clientId: string) => {
    router.push(`/admin/business/businesslogins?client_id=${clientId}`)
  }

  const handleViewFeesClick = (clientId: string) => {
    router.push(`/admin/business/fees?client_id=${clientId}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      const response = await post("/admin/create-dashboard-login", formData)
      if (response.status === 201 || response.status === 200) {
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

  const handleBusinessApproved = async () => {
    // Refresh the businesses list and stats
    await fetchBusinesses()
    await fetchBusinessStats()
    // Switch to the "All Companies" tab to show the updated list
    setCurrentTab("all")
    router.push("/admin/business/businesslist?tab=all")
  }

  const filteredBusinesses = businesses.filter(
    (business) =>
      ((business.business_name?.toLowerCase() || "").includes(filter.toLowerCase()) ||
        (business.contact_email?.toLowerCase() || "").includes(filter.toLowerCase())) &&
      (business.phone_number?.toLowerCase() || "").includes(phoneFilter.toLowerCase()) &&
      (business.address?.toLowerCase() || "").includes(regFilter.toLowerCase())
  )

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Business List</h1>
        </div>
        
        {/* Summary Cards */}
        {businessStats && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Total Businesses */}
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Businesses</p>
                    <p className="text-2xl font-bold text-gray-900">{businessStats.businesses}</p>
                  </div>
                </div>
              </Card>

              {/* Pending Businesses */}
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{businessStats.businessPendingCount}</p>
                  </div>
                </div>
              </Card>

              {/* Rejected Businesses */}
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{businessStats.businessRejectedCount}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Companies</TabsTrigger>
                <TabsTrigger value="pending">Pending Companies</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <Card className="p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Filter businesses..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Phone number..."
                      value={phoneFilter}
                      onChange={(e) => setPhoneFilter(e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Address..."
                      value={regFilter}
                      onChange={(e) => setRegFilter(e.target.value)}
                    />
                  </div>
                  {(filter || phoneFilter || regFilter) && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilter("")
                          setPhoneFilter("")
                          setRegFilter("")
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </Card>
                <div className="bg-white shadow sm:rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="text-muted-foreground">Loading businesses...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredBusinesses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <p className="text-muted-foreground">No businesses found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBusinesses.map((business) => (
                          <TableRow key={business.client_id}>
                            <TableCell>{business.business_name}</TableCell>
                            <TableCell>{business.contact_email}</TableCell>
                            <TableCell>{business.phone_number}</TableCell>
                            <TableCell>{business.contact_person_name}</TableCell>
                            <TableCell>{business.address}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                business.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {business.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleCreateLoginClick(business)}>
                                <UserPlusIcon className="h-4 w-4 mr-1" title="Create Login" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-2"
                                onClick={() => handleViewUsersClick(business.client_id)}>
                                <UsersIcon className="h-4 w-4" title="Users" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-2"
                                onClick={() => handleViewFeesClick(business.client_id)}>
                                <CurrencyDollarIcon className="h-4 w-4" title="Fees" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="pending">
                <PendingCompanies onBusinessApproved={handleBusinessApproved} />
              </TabsContent>
            </Tabs>
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
