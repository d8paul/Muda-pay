"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeReportTab, TransactionReportTab, DepositReportTab } from "./report-tabs";

const ReportsPageContent = () => {
  const [activeTab, setActiveTab] = useState("income");

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-500">View and manage your reports.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b border-gray-200">
              <TabsList className="bg-transparent w-full flex h-auto p-0 border-0">
                <TabsTrigger
                  value="income"
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  Income Report
                </TabsTrigger>
                <TabsTrigger
                  value="transaction"
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  Transaction Report
                </TabsTrigger>
                <TabsTrigger
                  value="deposit"
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  Deposit Report
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="income" className="mt-0">
                <IncomeReportTab />
              </TabsContent>
              <TabsContent value="transaction" className="mt-0">
                <TransactionReportTab />
              </TabsContent>
              <TabsContent value="deposit" className="mt-0">
                <DepositReportTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default function ReportsPage() {
  return <ReportsPageContent />;
}