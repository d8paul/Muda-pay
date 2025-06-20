/**
 * Liquidity Rail API Utility
 * Handles API calls specifically for Liquidity Rail endpoints
 * with dynamic environment-based URL selection
 */

interface ApiResponse<T = any> {
  status: number
  data: T
  message?: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

// Dynamic API URL selection based on hostname
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    return hostname === 'payments.muda.tech' 
      ? 'https://api.muda.tech/v1/rail'
      : 'https://rail.stage-mudax.xyz'
  }
  return 'https://rail.stage-mudax.xyz' // fallback to staging
}

// Get authentication token from storage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }
  return null
}

// Common headers for all requests
const getHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

// Generic request handler
const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw {
        response: {
          data: {
            message: data.message || `HTTP ${response.status}: ${response.statusText}`
          }
        }
      } as ApiError
    }

    return {
      status: data.status || response.status,
      data: data.data || data,
      message: data.message
    }
  } catch (error) {
    console.error(`Liquidity Rail API Error [${endpoint}]:`, error)
    throw error
  }
}

// GET request
export const lrGet = async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
  return makeRequest<T>(endpoint, {
    method: 'GET',
  })
}

// POST request
export const lrPost = async <T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> => {
  return makeRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PUT request
export const lrPut = async <T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> => {
  return makeRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// DELETE request
export const lrDelete = async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
  return makeRequest<T>(endpoint, {
    method: 'DELETE',
  })
}

// PATCH request
export const lrPatch = async <T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> => {
  return makeRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// Specific Liquidity Rail API endpoints
export const liquidityRailApi = {
  // Get charges
  getCharges: () => lrGet('/admin/getCharges'),
  
  // Update charges
  updateCharges: (id: number, data: any) => 
    lrPut('/admin/updateLRCharges', { id, ...data }),
  
  // Get transactions with query parameters
  getTransactions: (queryParams: string) => 
    lrGet(`/admin/reports/rails/transactions?${queryParams}`),
  
  // Get providers with pagination
  getProviders: (page: number = 1) => 
    lrGet(`/admin/reports/rails/providers?page=${page}`),
  
  // Get clients with query parameters
  getClients: (queryParams: string) => 
    lrGet(`/admin/reports/rails/clients?${queryParams}`),
  
  // Get profit reports with query parameters
  getProfitReport: (queryParams: string) => 
    lrGet(`/admin/reports/profits/liquidityrailnetwork?${queryParams}`),
  
  // Add more Liquidity Rail specific endpoints as needed
  // getFees: () => lrGet('/admin/fees'),
  // etc.
}

export default liquidityRailApi
