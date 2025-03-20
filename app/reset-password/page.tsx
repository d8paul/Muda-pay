import ResetPasswordForm from "@/components/ResetPasswordForm"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reset Password | MUDA-Pay Financial Dashboard",
  description: "Set a new password for your MUDA-Pay account",
}

export default function ResetPasswordPage() {
  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Loading...</h2>
          </div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
} 