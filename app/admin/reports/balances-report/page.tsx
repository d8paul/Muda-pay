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
import ReportFilters from "../components/ReportFilters";
import ProgressBar from "@/components/ui/progress-bar";
import PageHeader from "@/components/admin/PageHeader";

// Mock data for balances report
const balancesData = [
  { id: 1, accountName: "Main Operational Account", accountBalance: 450000000, assetBalance: 32500000, fiatBalance: 417500000, currency: "UGX" },
  { id: 2, accountName: "Settlement Account", accountBalance: 235000000, assetBalance: 85000000, fiatBalance: 150000000, currency: "UGX" },
  { id: 3, accountName: "Reserve Account", accountBalance: 780000000, assetBalance: 0, fiatBalance: 780000000, currency: "UGX" },
  { id: 4, accountName: "Transaction Fee Account", accountBalance: 132000000, assetBalance: 15000000, fiatBalance: 117000000, currency: "UGX" },
  { id: 5, accountName: "Corporate Client Account", accountBalance: 325000000, assetBalance: 125000000, fiatBalance: 200000000, currency: "UGX" },
];

const BalancesReportPage = () => {
  const [isLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleDateRangeChange = () => {
    // No date filtering for balances as they're current values
  };

  const handleResetFilters = () => {
    setSearchTerm("");
  };

  const filteredData = useMemo(() => {
    return balancesData.filter(balance => {
      // Search filter only
      return !searchTerm || 
        balance.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [balancesData, searchTerm]);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <PageHeader 
          title="Balances Reports" 
          description="View and analyze transaction data" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Balances Report</h2>
              <ReportFilters 
                onSearch={handleSearch}
                onDateRangeChange={handleDateRangeChange}
                onResetFilters={handleResetFilters}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account Balance</TableHead>
                  <TableHead>Asset Balance</TableHead>
                  <TableHead>Fiat Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell className="font-medium">{balance.accountName}</TableCell>
                      <TableCell>{balance.accountBalance.toLocaleString()} {balance.currency}</TableCell>
                      <TableCell>{balance.assetBalance.toLocaleString()} {balance.currency}</TableCell>
                      <TableCell>{balance.fiatBalance.toLocaleString()} {balance.currency}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
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

export default BalancesReportPage;