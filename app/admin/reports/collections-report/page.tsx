"use client";

import { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import FeesPageHeader from "@/components/admin/PageHeader";
import ReportFilters from "../components/ReportFilters";
import ProgressBar from "@/components/ui/progress-bar";

// Mock data for collections report
const collectionsData = [
  { id: 1, reference: "COL-001", amount: 350000, payer: "ABC Company", method: "Bank Transfer", date: "2025-04-28", currency: "UGX" },
  { id: 2, reference: "COL-002", amount: 275000, payer: "XYZ Corporation", method: "Mobile Money", date: "2025-04-28", currency: "UGX" },
  { id: 3, reference: "COL-003", amount: 420000, payer: "Global Enterprises", method: "Credit Card", date: "2025-04-27", currency: "UGX" },
  { id: 4, reference: "COL-004", amount: 150000, payer: "Local Business Ltd", method: "Mobile Money", date: "2025-04-27", currency: "UGX" },
  { id: 5, reference: "COL-005", amount: 390000, payer: "Smith & Partners", method: "Bank Transfer", date: "2025-04-26", currency: "UGX" },
];

const CollectionsReportPage = () => {
  const [isLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const filteredData = useMemo(() => {
    return collectionsData.filter(collection => {
      // Search filter
      const searchMatches = 
        !searchTerm || 
        collection.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.method.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      let dateMatches = true;
      if (startDate || endDate) {
        const collectionDate = new Date(collection.date);
        
        if (startDate && collectionDate < startDate) {
          dateMatches = false;
        }
        
        if (endDate) {
          // Add one day to end date to make it inclusive
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          
          if (collectionDate >= endDatePlusOne) {
            dateMatches = false;
          }
        }
      }
      
      return searchMatches && dateMatches;
    });
  }, [collectionsData, searchTerm, startDate, endDate]);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <FeesPageHeader 
          title="Collections Reports" 
          description="View and analyze transaction data" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Collections Report</h2>
              <ReportFilters 
                onSearch={handleSearch}
                onDateRangeChange={handleDateRangeChange}
                onResetFilters={handleResetFilters}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">{collection.reference}</TableCell>
                      <TableCell>{collection.amount.toLocaleString()} {collection.currency}</TableCell>
                      <TableCell>{collection.payer}</TableCell>
                      <TableCell>{collection.method}</TableCell>
                      <TableCell>{collection.date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No results found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionsReportPage;