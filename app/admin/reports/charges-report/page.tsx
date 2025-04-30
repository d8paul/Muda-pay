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

// Mock data for charges report
const chargesData = [
  { id: 1, reference: "CHG-001", amount: 15000, description: "Transaction Fee", account: "Main Account", date: "2025-04-28", currency: "UGX" },
  { id: 2, reference: "CHG-002", amount: 8500, description: "Withdrawal Fee", account: "User Account #12345", date: "2025-04-28", currency: "UGX" },
  { id: 3, reference: "CHG-003", amount: 25000, description: "Premium Service Fee", account: "Corporate Account #789", date: "2025-04-27", currency: "UGX" },
  { id: 4, reference: "CHG-004", amount: 12500, description: "Transfer Fee", account: "User Account #67890", date: "2025-04-27", currency: "UGX" },
  { id: 5, reference: "CHG-005", amount: 9000, description: "Processing Fee", account: "Merchant Account #456", date: "2025-04-26", currency: "UGX" },
];

const ChargesReportPage = () => {
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
    return chargesData.filter(charge => {
      // Search filter
      const searchMatches = 
        !searchTerm || 
        charge.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.account.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      let dateMatches = true;
      if (startDate || endDate) {
        const chargeDate = new Date(charge.date);
        
        if (startDate && chargeDate < startDate) {
          dateMatches = false;
        }
        
        if (endDate) {
          // Add one day to end date to make it inclusive
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          
          if (chargeDate >= endDatePlusOne) {
            dateMatches = false;
          }
        }
      }
      
      return searchMatches && dateMatches;
    });
  }, [chargesData, searchTerm, startDate, endDate]);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <FeesPageHeader 
          title="Charges Reports" 
          description="View and analyze transaction data" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Charges Report</h2>
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
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell className="font-medium">{charge.reference}</TableCell>
                      <TableCell>{charge.amount.toLocaleString()} {charge.currency}</TableCell>
                      <TableCell>{charge.description}</TableCell>
                      <TableCell>{charge.account}</TableCell>
                      <TableCell>{charge.date}</TableCell>
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

export default ChargesReportPage;
