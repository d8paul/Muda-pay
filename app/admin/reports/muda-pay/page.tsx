"use client"

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressBar from "@/components/ui/progress-bar";
import SummaryCards from "./components/reports/SummaryCards";
import TimeRangeSelector from "./components/reports/TimeRangeSelector";
import ProfitTab from "./components/reports/ProfitTab";
import VolumeTab from "./components/reports/VolumeTab";
import UsersTab from "./components/reports/UsersTab";
import ReconciliationTab from "./components/reports/ReconciliationTab";
import { get } from "@/utils/stage_api";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [reconciliationData, setReconciliationData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalTransactions: 0,
    totalClients: 0,
    totalTransactionFees: 0,
  });
  const [error, setError] = useState("");

  // Fetch reconciliation data
  useEffect(() => {
    const fetchReconciliationData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await get("admin/reports/accounts-reconciliation");
        console.log("Fetched reconciliation data:", data.data);

        // Map API response to match the expected structure
        const mappedData = data.data.map((account: any) => ({
          id: account.id,
          accountName: account.account_name,
          balance: account.balance,
          pendingDeposits: account.pending_deposits,
          pendingWithdrawals: account.pending_withdrawals,
          adjustedBalance: account.adjusted_balance,
          currency: account.currency,
        }));

        setReconciliationData(mappedData);
      } catch (err) {
        setError("Failed to fetch reconciliation data. Please try again later.");
        toast.error("Failed to fetch reconciliation data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReconciliationData();
  }, []);

  // Fetch summary data
  useEffect(() => {
    const fetchSummaryData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [transactions, clients, transactionFees] = await Promise.all([
          get("admin/reports/total-transactions"),
          get("admin/reports/total-clients"),
          get("admin/reports/total-transaction-fees"),
        ]);

        setSummaryData({
          totalTransactions: transactions.data.total || 0,
          totalClients: clients.data.total || 0,
          totalTransactionFees: transactionFees.data.total || 0,
        });
      } catch (err) {
        setError("Failed to fetch summary data. Please try again later.");
        toast.error("Failed to fetch summary data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Muda-pay Reports</h1>
          <p className="text-gray-500 mb-6">Analytics and performance insights</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Summary Cards */}
          <SummaryCards 
            totalTransactions={summaryData.totalTransactions}
            totalClients={summaryData.totalClients}
            totalTransactionFees={summaryData.totalTransactionFees}
          />

          {/* Time Range Selector */}
          <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />

          {/* Tabs for different report types */}
          <Tabs defaultValue="profit" className="w-full">
            <TabsList>
              <TabsTrigger value="profit">Profit on Trades</TabsTrigger>
              <TabsTrigger value="volume">Volume Report</TabsTrigger>
              <TabsTrigger value="users">User Growth</TabsTrigger>
              <TabsTrigger value="reconciliation">Account Reconciliation</TabsTrigger>
            </TabsList>
            
            {/* Profit on Trades Tab */}
            <TabsContent value="profit">
              <ProfitTab />
            </TabsContent>
            
            {/* Volume Report Tab */}
            <TabsContent value="volume">
              <VolumeTab />
            </TabsContent>
            
            {/* User Growth Tab */}
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
            
            {/* Account Reconciliation Tab */}
            <TabsContent value="reconciliation">
              {error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : (
                <ReconciliationTab reconciliationData={reconciliationData} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}