"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MudaPayTab from "./components/MudaPayTab"
import LiquidityRailTab from "./components/LiquidityRailTab"
import FeesPageHeader from "@/components/admin/PageHeader"

export default function ProfitLossReport() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "mudapay"

  return (
    <div className="py-6">
      <FeesPageHeader 
        title="Profit and Loss Report" 
        description="View and analyze profit and loss metrics for transactions" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Tabs value={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="mudapay">MudaPay</TabsTrigger>
            <TabsTrigger value="liquidityrail">Liquidity Rail</TabsTrigger>
          </TabsList>
          <TabsContent value="mudapay">
            <Card>
              <CardHeader>
                <CardTitle>MudaPay Profit Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <MudaPayTab />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="liquidityrail">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Rail Network Profit Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <LiquidityRailTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 