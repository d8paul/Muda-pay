"use client"

import { useState, useEffect } from "react"
import { get, post } from "@/utils/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface ClientInfo {
  id: number
  client_id: string
  contact_email: string
  business_name: string
  phone_number: string
  country: string
  city: string | null
  address: string | null
  industry: string | null
  kyc_status: string
  registration_number: string
  contact_person_name: string
  contact_phone: string
  created_at: string
  environment: string
}

export default function CompanyInfoTab() {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false)

  useEffect(() => {
    const fetchClientInfo = async () => {
      setIsLoading(true)
      try {
        const mockData = {
          id: 2,
          client_id: "10819033",
          contact_email: "test@f.com",
          business_name: "Bava Limited",
          phone_number: "+256700000000",
          country: "UGANDA",
          city: null,
          address: null,
          industry: null,
          kyc_status: "unverified", 
          registration_number: "33232",
          contact_person_name: "Emma",
          contact_phone: "0787719618",
          created_at: "2025-02-17T12:51:38.000Z",
          environment: "test"
        };
        
        setClientInfo(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching client information:", error)
        setError("An error occurred while fetching client information")
        setIsLoading(false)
      }
    }

    fetchClientInfo()
  }, [])

  const handleSubmitKyc = async () => {
    if (!clientInfo || clientInfo.kyc_status !== "unverified") return;

    setIsSubmittingKyc(true);
    try {
      // This would be an actual API call in production
      // await post("clients/submit-kyc", { clientId: clientInfo.id });
      
      // Simulating API success
      setTimeout(() => {
        if (clientInfo) {
          const updatedInfo = { ...clientInfo, kyc_status: "inReview" };
          setClientInfo(updatedInfo);
          toast.success("KYC submission successful. Your application is under review.");
        }
        setIsSubmittingKyc(false);
      }, 1000);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast.error("Failed to submit KYC. Please try again.");
      setIsSubmittingKyc(false);
    }
  };

  const InfoItem = ({ label, value }: { label: string; value: string | null }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
        {value || "Not provided"}
      </dd>
    </div>
  )

  const getKycStatusBanner = (status: string) => {
    if (status === "verified") {
      return (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">KYC Verified</h3>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button disabled variant="outline" className="text-xs py-1 px-3 h-auto opacity-60">
              Submit KYC
            </Button>
          </div>
        </div>
      )
    } else if (status === "inReview") {
      return (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">KYC In Review</h3>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button disabled variant="outline" className="text-xs py-1 px-3 h-auto opacity-60">
              Submit KYC
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">KYC Unverified</h3>
            </div>
          </div>
          
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-5 w-[250px]" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        {error}
      </div>
    )
  }

  if (!clientInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
        No client information available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KYC Status Banner */}
      {getKycStatusBanner(clientInfo.kyc_status)}

      <Card className="overflow-hidden bg-white shadow">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Business Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Business details and registration information.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <InfoItem label="Business Name" value={clientInfo.business_name} />
            <InfoItem label="Registration Number" value={clientInfo.registration_number} />
            <InfoItem label="Industry" value={clientInfo.industry} />
            <InfoItem label="Country" value={clientInfo.country} />
            <InfoItem label="City" value={clientInfo.city} />
            <InfoItem label="Address" value={clientInfo.address} />
            <InfoItem label="Environment" value={clientInfo.environment} />
          </dl>
        </div>
      </Card>

      <Card className="overflow-hidden bg-white shadow">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Contact Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Primary contact details for your account.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <InfoItem label="Contact Person" value={clientInfo.contact_person_name} />
            <InfoItem label="Contact Email" value={clientInfo.contact_email} />
            <InfoItem label="Business Phone" value={clientInfo.phone_number} />
            <InfoItem label="Contact Phone" value={clientInfo.contact_phone} />
            <InfoItem label="Client ID" value={clientInfo.client_id} />
            <InfoItem label="Account Created" value={new Date(clientInfo.created_at).toLocaleDateString()} />
          </dl>
        </div>
      </Card>
    </div>
  )
} 