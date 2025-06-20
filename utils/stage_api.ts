import axios from "axios"
import toast from "react-hot-toast"

const api = axios.create({

  baseURL: "https://api.muda.tech/web/",
    // baseURL: "http://localhost:8035",
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    console.log("token", token)
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Enhanced error message extraction function
const extractErrorMessage = (error: any): string => {
  // Handle axios error responses
  if (error.response?.data) {
    const data = error.response.data
    
    // Handle your API's specific error structure: {status: 400, message: "error message here"}
    if (data.status && data.message) {
      return data.message
    }
    
    // Handle other common error message fields
    if (data.message) return data.message
    if (data.error) return data.error
    if (data.detail) return data.detail
    
    // Handle validation errors array
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((err: any) => {
        if (typeof err === 'string') return err
        if (err.message) return err.message
        if (err.field && err.message) return `${err.field}: ${err.message}`
        return JSON.stringify(err)
      }).join(', ')
    }
    
    // Handle validation errors object
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.entries(data.errors)
        .map(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`
          }
          return `${field}: ${messages}`
        })
      return errorMessages.join(', ')
    }
    
    // Handle nested data structure
    if (data.data?.message) return data.data.message
    if (data.data?.error) return data.data.error
  }
  
  // Handle direct API response errors (when error is the response itself)
  if (error.status && error.message) {
    return error.message
  }
  
  // Fallback to direct error message
  if (error.message) return error.message
  
  // Network or other errors
  if (error.code === 'NETWORK_ERROR') return "Network error. Please check your connection."
  if (error.code === 'ECONNABORTED') return "Request timeout. Please try again."
  
  return "An error occurred"
}

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = extractErrorMessage(error)
    toast.error(message)
    return Promise.reject(error)
  },
)

export const get = async (url: string, params = {}) => {
  try {
    const response = await api.get(url, { params })
    return response.data
  } catch (error) {
    console.error("GET request failed:", error)
    throw error
  }
}

export const post = async (url: string, data = {}) => {
  try {
    const response = await api.post(url, data)
    return response.data
  } catch (error) {
    console.error("POST request failed:", error)
    throw error
  }
}

export const put = async (url: string, data = {}) => {
  try {
    const response = await api.put(url, data)
    return response.data
  } catch (error) {
    console.error("PUT request failed:", error)
    throw error
  }
}

export const del = async (url: string) => {
  try {
    const response = await api.delete(url)
    return response.data
  } catch (error) {
    console.error("DELETE request failed:", error)
    throw error
  }
}

export default api

