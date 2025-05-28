import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import toast from "react-hot-toast"

export const useTwoFactorCheck = () => {
  const router = useRouter()
  const { checkTwoFactorStatus } = useUser()

  const checkAndRedirect = async () => {
    const isTwoFactorEnabled = await checkTwoFactorStatus()
    
    if (!isTwoFactorEnabled) {
      toast.error("Please enable Two-Factor Authentication before proceeding")
      router.push("/admin/settings")
      return false
    }
    
    return true
  }

  return { checkAndRedirect }
} 