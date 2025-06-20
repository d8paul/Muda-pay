"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ProgressBar from "@/components/ProgressBar"
import PaymentMethodsTable from "./components/PaymentMethodsTable"
import PaymentMethodForm from "./components/PaymentMethodForm"
import DeletePaymentMethodDialog from "./components/DeletePaymentMethodDialog"
import { usePaymentMethods } from "./hooks/usePaymentMethods"
import { usePaymentMethodForm } from "./hooks/usePaymentMethodForm"

export default function PaymentMethodsPage() {
  const { isLoading, banks, createBank, updateBank, deleteBank } = usePaymentMethods()
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
          <div className="py-4">
            <PaymentMethodsTable
              banks={banks}
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
    </>
  )
}
