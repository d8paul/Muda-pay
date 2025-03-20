import ResetPasswordForm from "@/components/ResetPasswordForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password | MUDA-Pay Financial Dashboard",
  description: "Set a new password for your MUDA-Pay account",
}

export default function ResetPasswordPage() {
  return (
    <main>
      <ResetPasswordForm />
    </main>
  )
} 