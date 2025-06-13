"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for transactions
const mockTransactions = [
  {
    id: "TRX001",
    date: "2024-03-20",
    type: "Mobile Money",
    amount: "1,000,000 UGX",
    status: "Completed",
    reference: "REF123456"
  },
  {
    id: "TRX002",
    date: "2024-03-19",
    type: "Bank Transfer",
    amount: "500,000 UGX",
    status: "Pending",
    reference: "REF123457"
  },
  // Add more mock transactions as needed
];

export default function ProviderTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Provider Transactions</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex gap-4">
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button className="bg-[#26a0ff] hover:bg-[#1f8ad8]">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === "Completed" 
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.reference}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 