"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";

export default function ClientOperationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Liquidity Operations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-500" />
              Deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Deposit funds into your liquidity pool
            </p>
            <Button className="w-full bg-[#26a0ff] hover:bg-[#1f8ad8]">
              Start Deposit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-blue-500" />
              Swap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Swap between different currencies
            </p>
            <Button className="w-full bg-[#26a0ff] hover:bg-[#1f8ad8]">
              Start Swap
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-500" />
              Withdraw
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Withdraw funds from your liquidity pool
            </p>
            <Button className="w-full bg-[#26a0ff] hover:bg-[#1f8ad8]">
              Start Withdraw
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 