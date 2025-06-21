"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FilterX } from "lucide-react"
import ProgressBar from "@/components/ProgressBar"
import PaymentMethodsTable from "./components/PaymentMethodsTable"
import PaymentMethodForm from "./components/PaymentMethodForm"
import DeletePaymentMethodDialog from "./components/DeletePaymentMethodDialog"
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"
import { usePaymentMethods } from "./hooks/usePaymentMethods"
import { usePaymentMethodForm } from "./hooks/usePaymentMethodForm"

export default function PaymentMethodsPage() {
  const { 
    isLoading, 
    banks, 
    createBank, 
    updateBank, 
    deleteBank,
    show2FAModal,
    setShow2FAModal,
    handle2FASubmit,
    twoFALoading
  } = usePaymentMethods()
  const {
    isModalOpen,
    setIsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    editingBank,
    deletingBank,
    formData,
    isSubmitting,
    setIsSubmitting,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    closeDeleteModal,
    handleInputChange
  } = usePaymentMethodForm()

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedCurrency, setSelectedCurrency] = useState("all")

  // Get unique countries and currencies from banks data
  const uniqueCountries = useMemo(() => {
    const countries = new Set(banks.map(bank => bank.country))
    return Array.from(countries).sort()
  }, [banks])

  const uniqueCurrencies = useMemo(() => {
    const currencies = new Set(banks.map(bank => bank.currency))
    return Array.from(currencies).sort()
  }, [banks])

  // Filter banks based on search term and selected filters
  const filteredBanks = useMemo(() => {
    return banks.filter(bank => {
      const matchesSearch = !searchTerm || 
        bank.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.swift_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.reference_code.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCountry = selectedCountry === "all" || bank.country === selectedCountry
      const matchesCurrency = selectedCurrency === "all" || bank.currency === selectedCurrency
      
      return matchesSearch && matchesCountry && matchesCurrency
    })
  }, [banks, searchTerm, selectedCountry, selectedCurrency])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCountry("all")
    setSelectedCurrency("all")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingBank) {
        await updateBank(editingBank.id, formData)
      } else {
        await createBank(formData)
      }
      closeModal()
    } catch (error) {
      console.error("Error saving bank:", error)
      // Error toast is handled in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingBank) return

    setIsSubmitting(true)
    try {
      await deleteBank(deletingBank.id)
      closeDeleteModal()
    } catch (error) {
      console.error("Error deleting bank:", error)
      // Error toast is handled in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Payment Methods</h1>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Filters Section */}
          <div className="py-4">
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, account, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {uniqueCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      {uniqueCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full flex items-center gap-2"
                  >
                    <FilterX className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {/* Filter Summary */}
              {(searchTerm || selectedCountry !== "all" || selectedCurrency !== "all") && (
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>Showing {filteredBanks.length} of {banks.length} payment methods</span>
                  {searchTerm && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCountry !== "all" && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Country: {selectedCountry}
                    </span>
                  )}
                  {selectedCurrency !== "all" && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Currency: {selectedCurrency}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <PaymentMethodsTable
              banks={filteredBanks}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onCreateFirst={openCreateModal}
            />
          </div>
        </div>
      </div>

      <PaymentMethodForm
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingBank={editingBank}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeletePaymentMethodDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        deletingBank={deletingBank}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
      />

      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={twoFALoading}
      />
    </>
  )
}
