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

// Mock data for payouts report
const payoutsData = [
  { id: 1, reference: "PAY-001", amount: 250000, recipient: "John Doe", status: "completed", date: "2025-04-28", currency: "UGX" },
  { id: 2, reference: "PAY-002", amount: 175000, recipient: "Jane Smith", status: "pending", date: "2025-04-28", currency: "UGX" },
  { id: 3, reference: "PAY-003", amount: 320000, recipient: "Robert Johnson", status: "completed", date: "2025-04-27", currency: "UGX" },
  { id: 4, reference: "PAY-004", amount: 450000, recipient: "Emily Davis", status: "failed", date: "2025-04-27", currency: "UGX" },
  { id: 5, reference: "PAY-005", amount: 190000, recipient: "Michael Wilson", status: "completed", date: "2025-04-26", currency: "UGX" },
];

const PayoutsReportPage = () => {
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
    return payoutsData.filter(payout => {
      // Search filter
      const searchMatches = 
        !searchTerm || 
        payout.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      let dateMatches = true;
      if (startDate || endDate) {
        const payoutDate = new Date(payout.date);
        
        if (startDate && payoutDate < startDate) {
          dateMatches = false;
        }
        
        if (endDate) {
          // Add one day to end date to make it inclusive
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          
          if (payoutDate >= endDatePlusOne) {
            dateMatches = false;
          }
        }
      }
      
      return searchMatches && dateMatches;
    });
  }, [payoutsData, searchTerm, startDate, endDate]);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <FeesPageHeader 
          title="Payout Reports" 
          description="View and analyze transaction data" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Payouts Report</h2>
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
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">{payout.reference}</TableCell>
                      <TableCell>{payout.amount.toLocaleString()} {payout.currency}</TableCell>
                      <TableCell>{payout.recipient}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payout.status === "completed" ? "bg-green-100 text-green-800" :
                          payout.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {payout.status}
                        </span>
                      </TableCell>
                      <TableCell>{payout.date}</TableCell>
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

export default PayoutsReportPage;
