import axios from "axios"
import toast from "react-hot-toast"

const api = axios.create({
  baseURL: "https://api.muda.tech/web/",
  // baseURL: "http://localhost:8000",
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

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An error occurred"
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

