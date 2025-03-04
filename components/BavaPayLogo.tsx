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
      {/* <rect width="200" height="50" rx="8" fill="#1F2937" /> */}

      {/* BAVA Text */}
      <text
        x="50%"
        y="58%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#1f2937"
        fontSize="30"
        fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        MUDA
      </text>

      {/* Accent Element - Stylized Slash */}
      <image
        href="/logo.png"
        x="10"
        y="4"
        height="40"
        width="40"
      />
    </svg>
  );
};

export default BavaLogo;
