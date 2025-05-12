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
import ReportFilters from "../components/ReportFilters";
import ProgressBar from "@/components/ui/progress-bar";
import { get } from "@/utils/api";
import { get as getApi } from "@/utils/stage_api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface WalletTransaction {
  id: number;
  client_id: string;
  validation_id: string;
  product_id: string;
  trans_type: string;
  trans_id: string;
  reference_id: string;
  stellar_tx_id: string | null;
  amount: string;
  asset_code: string;
  currency: string;
  sender_account: string;
  receiver_account: string;
  memo: string;
  status: string;
  fee: string;
  service_name: string | null;
  SessionId: string | null;
  created_at: string;
}

const WalletReportPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [walletBalances, setWalletBalances] = useState<Record<string, WalletBalance[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<{ accountId: string; currency: string } | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionFilters, setTransactionFilters] = useState({
    search: "",
    status: "all",
    type: "all"
  });
  
  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (currencies.length > 0) {
      fetchWalletBalances();
    }
  }, [currencies]);

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
    setIsLoading(true);
    try {
      const balances: Record<string, WalletBalance[]> = {};
      
      await Promise.all(
        currencies.map(async (currency) => {
          try {
            const response = await get(`/admin/wallets/${currency.currency.toLowerCase()}`);
            if (response.status === 200) {
              balances[currency.currency] = response.data;
            }
          } catch (error) {
            console.error(`Error fetching ${currency.currency} balances:`, error);
          }
        })
      );
      
      setWalletBalances(balances);
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
      setError("Failed to fetch wallet balances");
      toast.error("Failed to fetch wallet balances");
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
    setTransactionFilters({
      search: "",
      status: "all",
      type: "all"
    });
  };

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
    const allWallets: any[] = [];
    
    Object.entries(walletBalances).forEach(([currency, balances]) => {
      balances.forEach((balance) => {
        allWallets.push({
          id: balance.wallet.accountId,
          walletName: `${balance.businessName} (${currency})`,
          balance: parseFloat(balance.wallet.balance),
          cBalance: parseFloat(balance.wallet.cBalance),
          currency: currency,
          fiatCurrency: currency,
        });
      });
    });

    return allWallets.filter(wallet => {
      return !searchTerm || 
        wallet.walletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.currency.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [walletBalances, searchTerm]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = !transactionFilters.search || 
        transaction.reference_id.toLowerCase().includes(transactionFilters.search.toLowerCase()) ||
        transaction.trans_id.toLowerCase().includes(transactionFilters.search.toLowerCase());
      
      const matchesStatus = transactionFilters.status === "all" || 
        transaction.status === transactionFilters.status;
      
      const matchesType = transactionFilters.type === "all" || 
        transaction.trans_type === transactionFilters.type;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, transactionFilters]);

  if (selectedWallet) {
    return (
      <>
        <ProgressBar isLoading={isLoading} />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Wallets
              </Button>
              <h1 className="text-2xl font-semibold">Wallet Transactions</h1>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Input
                      placeholder="Search by ID or Reference"
                      value={transactionFilters.search}
                      onChange={(e) => setTransactionFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Select
                      value={transactionFilters.type}
                      onValueChange={(value) => setTransactionFilters(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Transaction Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="PULL">Pull</SelectItem>
                        <SelectItem value="PUSH">Push</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={transactionFilters.status}
                      onValueChange={(value) => setTransactionFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Transaction Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="SUCCESS">Success</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => setTransactionFilters({ search: "", status: "all", type: "all" })}
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                        <TableCell>{transaction.trans_id}</TableCell>
                        <TableCell>{transaction.trans_type}</TableCell>
                        <TableCell>{parseFloat(transaction.amount).toLocaleString()} {transaction.currency}</TableCell>
                        <TableCell>{transaction.reference_id}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No transactions found
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
                  <TableHead>Payout Balance</TableHead>
                  <TableHead>Collection Balance</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
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
