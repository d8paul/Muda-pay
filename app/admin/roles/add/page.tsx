"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AddRoleModal from "../components/add-role-modal"

export default function AddRole() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(true)

  const handleClose = () => {
    setIsModalOpen(false)
    router.push("/admin/roles")
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    router.push("/admin/roles")
  }

  return (
    <AddRoleModal
      open={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
} 