import type React from "react"

interface ProgressBarProps {
  isLoading: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading }) => {
  return (
    <div
      className={`fixed top-0 left-0 w-full h-1 bg-gray-200 transition-opacity duration-300 ${isLoading ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`h-full bg-indigo-600 transition-all duration-300 ease-out ${
          isLoading ? "w-3/4 animate-pulse" : "w-full"
        }`}
      ></div>
    </div>
  )
}

export default ProgressBar

