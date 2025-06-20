"use client"

import { useState } from "react"
import { Bank, BankFormData, initialFormData } from "../types"

export function usePaymentMethodForm() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [deletingBank, setDeletingBank] = useState<Bank | null>(null)
  const [formData, setFormData] = useState<BankFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCreateModal = () => {
    setEditingBank(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  const openEditModal = (bank: Bank) => {
    setEditingBank(bank)
    setFormData({
      bank_name: bank.bank_name,
      account_name: bank.account_name,
      account_number: bank.account_number,
      swift_code: bank.swift_code,
      country: bank.country,
      currency: bank.currency,
      reference_code: bank.reference_code
    })
    setIsModalOpen(true)
  }

  const openDeleteModal = (bank: Bank) => {
    setDeletingBank(bank)
    setIsDeleteModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBank(null)
    setFormData(initialFormData)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingBank(null)
  }

  const handleInputChange = (field: keyof BankFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return {
    // Modal states
    isModalOpen,
    setIsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    
    // Banking states
    editingBank,
    deletingBank,
    formData,
    isSubmitting,
    setIsSubmitting,

    // Actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    closeDeleteModal,
    handleInputChange
  }
}
