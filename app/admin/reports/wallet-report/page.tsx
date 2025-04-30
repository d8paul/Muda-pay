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

// Mock data for wallet report
const walletData = [
  { id: 1, walletName: "Main Bitcoin Wallet", balance: 3.75, fiatEquivalent: 420000000, currency: "BTC", fiatCurrency: "UGX" },
  { id: 2, walletName: "Ethereum Holdings", balance: 48.2, fiatEquivalent: 268000000, currency: "ETH", fiatCurrency: "UGX" },
  { id: 3, walletName: "USDT Reserve", balance: 185000, fiatEquivalent: 185000000, currency: "USDT", fiatCurrency: "UGX" },
  { id: 4, walletName: "XRP Operational", balance: 125000, fiatEquivalent: 87500000, currency: "XRP", fiatCurrency: "UGX" },
  { id: 5, walletName: "Secondary BTC", balance: 1.25, fiatEquivalent: 140000000, currency: "BTC", fiatCurrency: "UGX" },
];

const WalletReportPage = () => {
  const [isLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleDateRangeChange = () => {
    // No date filtering for wallet balances as they're current values
  };

  const handleResetFilters = () => {
    setSearchTerm("");
  };

  const filteredData = useMemo(() => {
    return walletData.filter(wallet => {
      // Search filter only
      return !searchTerm || 
        wallet.walletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.currency.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [walletData, searchTerm]);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <FeesPageHeader 
          title="Wallet Reports" 
          description="View and analyze transaction data" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Wallet Balance Report</h2>
              <ReportFilters 
                onSearch={handleSearch}
                onDateRangeChange={handleDateRangeChange}
                onResetFilters={handleResetFilters}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Name</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Fiat Equivalent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">{wallet.walletName}</TableCell>
                      <TableCell>{wallet.balance} {wallet.currency}</TableCell>
                      <TableCell>{wallet.fiatEquivalent.toLocaleString()} {wallet.fiatCurrency}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
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

export default WalletReportPage;
