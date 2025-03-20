import ForgotPasswordForm from "@/components/ForgotPasswordForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password | MUDA-Pay Financial Dashboard",
  description: "Reset your MUDA-Pay account password",
}

export default function ForgotPasswordPage() {
  return (
    <main>
      <ForgotPasswordForm />
    </main>
  )
} 