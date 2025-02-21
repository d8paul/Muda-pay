import type React from "react"

interface BavaPayLogoProps {
  className?: string
}

const BavaPayLogo: React.FC<BavaPayLogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <svg className={className} viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="50" rx="8" fill="#1F2937" />
      <path
        d="M20 35V15H30C32.7614 15 35 17.2386 35 20V25C35 27.7614 32.7614 30 30 30H25L35 35"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M45 35V15H55C57.7614 15 60 17.2386 60 20V30C60 32.7614 57.7614 35 55 35H45"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M70 35V15H80C82.7614 15 85 17.2386 85 20V30C85 32.7614 82.7614 35 80 35H70"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M95 35V15H105C107.761 15 110 17.2386 110 20V25C110 27.7614 107.761 30 105 30H100L110 35"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M120 35V15H130C132.761 15 135 17.2386 135 20V30C135 32.7614 132.761 35 130 35H120"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M145 35V15H155C157.761 15 160 17.2386 160 20V30C160 32.7614 157.761 35 155 35H145"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M170 35V15H180C182.761 15 185 17.2386 185 20V30C185 32.7614 182.761 35 180 35H170"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  )
}

export default BavaPayLogo

