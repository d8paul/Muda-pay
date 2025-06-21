"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import FeesPageHeader from "@/components/admin/PageHeader";
import ProgressBar from "@/components/ui/progress-bar";
import { get } from "@/utils/api";
import { get as getApi } from "@/utils/stage_api";
import toast from "react-hot-toast";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WalletTransactions from "./components/WalletTransactions";

interface Currency {
  id: number;
  asset_code: string;
  asset_issuer: string;
  currency: string;
}

interface WalletBalance {
  wallet: {
    accountId: string;
    cBalance: string;
    balance: string;
  };
  clientId: string;
  businessName: string;
}

const WalletReportPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("UGX");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<{ accountId: string; currency: string } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (selectedCurrency && selectedCurrency !== "") {
      fetchWalletBalances();
    } else {
      setWalletBalances([]);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    if (selectedWallet) {
      fetchWalletTransactions(selectedWallet.accountId);
    }
  }, [selectedWallet]);

  const fetchCurrencies = async () => {
    setIsLoading(true);
    try {
      const response = await get("/clients/currencies");
      if (response.status === 200) {
        setCurrencies(response.data);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
      setError("Failed to fetch currencies");
      toast.error("Failed to fetch currencies");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalances = async () => {
    if (!selectedCurrency) return;
    
    setIsLoading(true);
    try {
      const response = await get(`/admin/wallets/${selectedCurrency.toLowerCase()}`);
      if (response.status === 200) {
        setWalletBalances(response.data || []);
      } else {
        setWalletBalances([]);
      }
    } catch (error) {
      console.error(`Error fetching ${selectedCurrency} balances:`, error);
      setError(`Failed to fetch ${selectedCurrency} wallet balances`);
      toast.error(`Failed to fetch ${selectedCurrency} wallet balances`);
      setWalletBalances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletTransactions = async (accountId: string) => {
    setIsLoading(true);
    try {
      const response = await getApi(`/admin/wallet-reconciliations/${accountId}`);
      if (response.status === 200) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      toast.error("Failed to fetch wallet transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletClick = (wallet: { accountId: string; currency: string }) => {
    setSelectedWallet(wallet);
  };

  const handleBackClick = () => {
    setSelectedWallet(null);
    setTransactions([]);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCurrency("UGX");
    setWalletBalances([]);
  };

  const filteredData = useMemo(() => {
    if (!selectedCurrency || walletBalances.length === 0) {
      return [];
    }
    
    return walletBalances
      .map((balance) => ({
        id: balance.wallet.accountId,
        walletName: `${balance.businessName} (${selectedCurrency})`,
        balance: parseFloat(balance.wallet.balance),
        cBalance: parseFloat(balance.wallet.cBalance),
        currency: selectedCurrency,
        fiatCurrency: selectedCurrency,
      }))
      .filter(wallet => {
        const matchesSearch = !searchTerm || 
          wallet.walletName.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      });
  }, [walletBalances, searchTerm, selectedCurrency]);

  const uniqueCurrencies = useMemo(() => {
    const currencySet = new Set(currencies.map(c => c.currency));
    return Array.from(currencySet).sort();
  }, [currencies]);

  if (selectedWallet) {
    return (
      <WalletTransactions
        transactions={transactions}
        isLoading={isLoading}
        onBack={handleBackClick}
      />
    );
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <FeesPageHeader 
          title="Wallet Reports" 
          description="View and analyze wallet balances across all currencies" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Wallet Balance Report</h2>
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <div className="flex-1 min-w-[240px] flex items-center border rounded-md px-3 bg-white">
                  <Input
                    type="text"
                    placeholder="Search by wallet name or currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearch(searchTerm)}
                    className="ml-2"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-[200px]">
                  <Select
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2"
                >
                  <FilterX className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Name</TableHead>
                  <TableHead>Payout Balance</TableHead>
                  <TableHead>Collection Balance</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedCurrency ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Please select a currency to view wallet balances
                    </TableCell>
                  </TableRow>
                ) : filteredData.length > 0 ? (
                  filteredData.map((wallet) => (
                    <TableRow 
                      key={wallet.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleWalletClick({ accountId: wallet.id, currency: wallet.currency })}
                    >
                      <TableCell className="font-medium">{wallet.walletName}</TableCell>
                      <TableCell>{wallet.balance.toLocaleString()}</TableCell>
                      <TableCell>{wallet.cBalance.toLocaleString()}</TableCell>
                      <TableCell>{wallet.currency}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No wallet balances found for {selectedCurrency}
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
