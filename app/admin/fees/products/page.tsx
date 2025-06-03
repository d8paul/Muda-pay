"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import FeeProducts from "../components/FeeProducts";

export default function FeeProductsPage() {
  const router = useRouter();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/admin/business/businesslist")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Businesses
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Fee Products</h1>
        <p className="text-gray-500 mb-6">Manage your fee products</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <FeeProducts />
        </div>
      </div>
    </div>
  );
} 