import axios from "axios"
import toast from "react-hot-toast"

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'payments.muda.tech') {
      return 'https://api.muda.tech/web/'
    }
    return 'https://ag-api.bavana.site/'
  }
  return 'https://ag-api.bavana.site/' // Default for server-side rendering
}

const api = axios.create({
  baseURL: getBaseURL(),
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor that focuses on response body status
api.interceptors.response.use(
  (response) => {
    // Check response body for status field
    const responseData = response.data
    if (responseData && typeof responseData.status === 'number' && responseData.status !== 200) {
      // Show error notification using message from response body
      const message = responseData.message || `Request failed with status ${responseData.status}`
      toast.error(message)
      
      // Create error object but don't throw - let the component handle it
      const error = {
        response: {
          data: responseData
        },
        status: responseData.status,
        message: message,
        isHandled: true // Flag to indicate we've already shown the toast
      }
      
      // Reject the promise with the error so components can still catch it
      return Promise.reject(error)
    }
    return response
  },
  (error) => {
    // Handle network errors or other axios errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.message) {
      toast.error(error.message)
    } else {
      toast.error("An error occurred")
    }
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

