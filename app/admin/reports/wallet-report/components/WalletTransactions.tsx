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
import ProgressBar from "@/components/ui/progress-bar";
import { ArrowLeft, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface WalletTransactionsProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
  onBack: () => void;
}

export default function WalletTransactions({ transactions, isLoading, onBack }: WalletTransactionsProps) {
  const [transactionFilters, setTransactionFilters] = useState({
    search: "",
    status: "all",
    type: "all"
  });

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

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
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