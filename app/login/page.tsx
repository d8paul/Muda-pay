import LoginForm from "@/components/LoginForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | MUDA-Pay Financial Dashboard",
  description: "Login to access your MUDA-Pay financial dashboard",
}

export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  )
}

