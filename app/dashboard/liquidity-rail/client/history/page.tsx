"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClientHistoryPage() {
  // Mock data - replace with actual data from your API
  const transactions = [
    {
      id: "TRX001",
      date: "2024-03-20",
      type: "Deposit",
      amount: "1,000.00",
      status: "Completed",
      reference: "DEP-2024-001"
    },
    {
      id: "TRX002",
      date: "2024-03-19",
      type: "Swap",
      amount: "500.00",
      status: "Completed",
      reference: "SWP-2024-001"
    },
    {
      id: "TRX003",
      date: "2024-03-18",
      type: "Withdraw",
      amount: "750.00",
      status: "Completed",
      reference: "WTH-2024-001"
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex gap-4">
              <Input
                placeholder="Search transactions..."
                className="w-64"
              />
              <Button variant="outline">
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
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
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