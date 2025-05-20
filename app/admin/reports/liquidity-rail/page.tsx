"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TransactionsTab from "./components/TransactionsTab"
import ClientsTab from "./components/ClientsTab"
import ProvidersTab from "./components/ProvidersTab"
import FeesTab from "./components/FeesTab"

export default function LiquidityRailReportsPage() {
  const [activeTab, setActiveTab] = useState("transactions")
  const [selectedClientId, setSelectedClientId] = useState<string>("10819033") // Default client ID

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Liquidity Rail Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze liquidity rail performance metrics
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Report</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Report</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientsTab onClientSelect={setSelectedClientId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle>Provider Report</CardTitle>
              </CardHeader>
              <CardContent>
                <ProvidersTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fees Report</CardTitle>
              </CardHeader>
              <CardContent>
                <FeesTab clientId={selectedClientId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}