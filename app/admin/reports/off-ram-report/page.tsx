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

// Mock data for off ram report
const offRamData = [
  { id: 1, txHash: "0x8f2e...3b4a", amount: 0.25, fiatAmount: 2800000, status: "completed", date: "2025-04-28", currency: "BTC", fiatCurrency: "UGX" },
  { id: 2, txHash: "0x7a1c...9d5f", amount: 1.75, fiatAmount: 1950000, status: "pending", date: "2025-04-28", currency: "ETH", fiatCurrency: "UGX" },
  { id: 3, txHash: "0x6b3d...2c7e", amount: 125, fiatAmount: 375000, status: "completed", date: "2025-04-27", currency: "USDT", fiatCurrency: "UGX" },
  { id: 4, txHash: "0x5f4a...8e1b", amount: 0.15, fiatAmount: 1680000, status: "completed", date: "2025-04-27", currency: "BTC", fiatCurrency: "UGX" },
  { id: 5, txHash: "0x4e2c...7d9a", amount: 2.50, fiatAmount: 2790000, status: "failed", date: "2025-04-26", currency: "ETH", fiatCurrency: "UGX" },
];

const OffRamReportPage = () => {
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
    return offRamData.filter(transaction => {
      // Search filter
      const searchMatches = 
        !searchTerm || 
        transaction.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      let dateMatches = true;
      if (startDate || endDate) {
        const txDate = new Date(transaction.date);
        
        if (startDate && txDate < startDate) {
          dateMatches = false;
        }
        
        if (endDate) {
          // Add one day to end date to make it inclusive
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          
          if (txDate >= endDatePlusOne) {
            dateMatches = false;
          }
        }
      }
      
      return searchMatches && dateMatches;
    });
  }, [offRamData, searchTerm, startDate, endDate]);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <FeesPageHeader 
          title="Off Ram Reports" 
          description="View and analyze transaction data" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Off Ram Report</h2>
              <ReportFilters 
                onSearch={handleSearch}
                onDateRangeChange={handleDateRangeChange}
                onResetFilters={handleResetFilters}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Crypto Amount</TableHead>
                  <TableHead>Fiat Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.txHash}</TableCell>
                      <TableCell>{transaction.amount} {transaction.currency}</TableCell>
                      <TableCell>{transaction.fiatAmount.toLocaleString()} {transaction.fiatCurrency}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.status === "completed" ? "bg-green-100 text-green-800" :
                          transaction.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {transaction.status}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
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

export default OffRamReportPage;
