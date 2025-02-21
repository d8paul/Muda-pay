import type React from "react";

interface BavaLogoProps {
  className?: string;
}

const BavaLogo: React.FC<BavaLogoProps> = ({ className = "h-12 w-auto" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 50"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Background Rectangle */}
      <rect width="200" height="50" rx="8" fill="#1F2937" />

      {/* BAVA Text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="28"
        fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        BAVA
      </text>

      {/* Accent Element - Stylized Slash */}
      <path
        d="M30 10 L40 40"
        stroke="#FF4136"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default BavaLogo;
