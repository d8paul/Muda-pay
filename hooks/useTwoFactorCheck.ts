import { useRouter } from "next/navigation"
import { get } from "@/utils/api"
import toast from "react-hot-toast"

export const useTwoFactorCheck = () => {
  const router = useRouter()

  const checkAndRedirect = async () => {
    try {
      const response = await get("/admin/users/2fa/status")
      
      // Check if 2FA is enabled
      if (response?.status !== "active" && response?.data?.status !== "active") {
        toast.error("Please enable Two-Factor Authentication before proceeding")
        router.push("/admin/settings")
        return false
      }
      
      return true
    } catch (error) {
      console.error("Error checking 2FA status:", error)
      // Don't redirect on error, just log it
      return true
    }
  }

  return { checkAndRedirect }
} 