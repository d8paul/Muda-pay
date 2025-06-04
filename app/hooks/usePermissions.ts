import { useUser } from '@/contexts/UserContext'
import { get } from '@/utils/api'

export type AccessRight = {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// This will be populated with actual rights from the API
let permissionNames: string[] = []

export const fetchAccessRights = async (): Promise<AccessRight[]> => {
  try {
    const response = await get('/admin/roles/access/rights')
    if (response.status === 200) {
      // Update the permission names when we fetch them
      permissionNames = response.data.map((right: AccessRight) => right.name)
      return response.data
    }
    return []
  } catch (error) {
    console.error('Error fetching access rights:', error)
    return []
  }
}

// Initialize permissions by fetching them
fetchAccessRights()

export const usePermissions = (requiredPermission?: string) => {
  const { user } = useUser()

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Admin role has all permissions
    if (user.role === 'admin') return true

    // Check if the permission exists in the user's access rights
    return user.role_details?.access_rights?.includes(permission) ?? false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  // If a required permission was passed, check it immediately
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : undefined

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRequiredPermission,
    availablePermissions: permissionNames
  }
} 