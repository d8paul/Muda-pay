"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TransactionsTab from "./components/TransactionsTab"
import FeesPageHeader from "@/components/admin/PageHeader"

export default function ProfitLossReport() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "transactions"

  return (
    <div className="py-6">
      <FeesPageHeader 
        title="Profit and Loss Report" 
        description="View and analyze profit and loss metrics for transactions" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Tabs value={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>MudaPay Profit Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 