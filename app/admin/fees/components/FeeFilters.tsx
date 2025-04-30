import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select as SelectPrimitive,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FeeFilters {
  feeName: string;
  feeType: string;
  applicableTo: string;
  status: string;
}

interface FeeFiltersProps {
  filters: FeeFilters;
  onFilterChange: (filters: FeeFilters) => void;
  onResetFilters: () => void;
}

const FeeFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
}: FeeFiltersProps) => {
  const handleChange = (name: keyof FeeFilters, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-4 rounded-md shadow mb-6 space-y-4">
      <h2 className="font-medium text-lg mb-3">Filter Transaction Fees</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fee Name</label>
          <Input
            placeholder="Search by name"
            value={filters.feeName}
            onChange={(e) => handleChange("feeName", e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Fee Type</label>
          <SelectPrimitive
            value={filters.feeType}
            onValueChange={(value) => handleChange("feeType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </SelectPrimitive>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Applicable To</label>
          <SelectPrimitive
            value={filters.applicableTo}
            onValueChange={(value) => handleChange("applicableTo", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </SelectPrimitive>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <SelectPrimitive
            value={filters.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </SelectPrimitive>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onResetFilters}
          className="mr-2"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default FeeFilters;
