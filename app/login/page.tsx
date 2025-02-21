import LoginForm from "@/components/LoginForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | BavaPay Financial Dashboard",
  description: "Login to access your BavaPay financial dashboard",
}

export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  )
}

