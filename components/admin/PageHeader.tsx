import React from "react";

interface FeesPageHeaderProps {
  title: string;
  description: string;
}

const PageHeader: React.FC<FeesPageHeaderProps> = ({ title, description }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">{title}</h1>
      <p className="text-gray-500 mb-6">{description}</p>
    </div>
  );
};

export default PageHeader;