"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProgressBar from "@/components/ui/progress-bar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search } from "lucide-react";

// Mock data for Transactions statement
const transactionsData = [
  { id: 1, date: "2025-04-25", reference: "LR-25042025-001", type: "Deposit", amount: 25000000, clientName: "Acme Corporation", status: "Completed" },
  { id: 2, date: "2025-04-26", reference: "LR-26042025-002", type: "Withdrawal", amount: 12000000, clientName: "TechSolutions Inc", status: "Completed" },
  { id: 3, date: "2025-04-27", reference: "LR-27042025-003", type: "Transfer", amount: 8000000, clientName: "Global Traders", status: "Pending" },
  { id: 4, date: "2025-04-28", reference: "LR-28042025-004", type: "Deposit", amount: 15000000, clientName: "Infinite Ventures", status: "Completed" },
];

// Mock data for Clients list
const clientsData = [
  { id: 1, clientName: "Acme Corporation", accountNumber: "LR-ACC-001", dateOnboarded: "2025-01-15", status: "Active", totalBalance: 1250000 },
  { id: 2, clientName: "TechSolutions Inc", accountNumber: "LR-ACC-002", dateOnboarded: "2025-02-10", status: "Active", totalBalance: 870000 },
  { id: 3, clientName: "Global Traders", accountNumber: "LR-ACC-003", dateOnboarded: "2025-03-05", status: "Inactive", totalBalance: 450000 },
  { id: 4, clientName: "Infinite Ventures", accountNumber: "LR-ACC-004", dateOnboarded: "2025-04-01", status: "Active", totalBalance: 930000 },
];

// Mock data for Fees and charges
const feesData = [
  { id: 1, feeName: "Transaction Processing", feeAmount: 1500, feeType: "Fixed", applicableTo: "All Transactions", dateCreated: "2025-01-01" },
  { id: 2, feeName: "Large Deposit", feeAmount: 0.5, feeType: "Percentage", applicableTo: "Deposits > 50,000,000", dateCreated: "2025-01-01" },
  { id: 3, feeName: "Express Withdrawal", feeAmount: 5000, feeType: "Fixed", applicableTo: "Same-day Withdrawals", dateCreated: "2025-02-15" },
  { id: 4, feeName: "International Transfer", feeAmount: 1.2, feeType: "Percentage", applicableTo: "International Transfers", dateCreated: "2025-03-10" },
];

// Mock data for monthly fees collected
const monthlyFeesData = [
  { month: "Jan", fees: 250000 },
  { month: "Feb", fees: 320000 },
  { month: "Mar", fees: 280000 },
  { month: "Apr", fees: 350000 },
];

export default function LiquidityRailReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactionsData.filter((transaction) =>
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clientsData.filter((client) =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Liquidity Rail Reports</h1>
          <p className="text-gray-500 mb-6">Manage and analyze your liquidity rail operations</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {transactionsData.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {clientsData.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {clientsData.filter(client => client.status === "Active").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Fees Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {monthlyFeesData.reduce((sum, item) => sum + item.fees, 0).toLocaleString()} UGX
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Date Range Selector */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <Label htmlFor="dateRange">Date Range:</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="dateRange" className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search input */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Search by client name, reference, or account number..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs for different report types */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList>
              <TabsTrigger value="transactions">Transactions Statement</TabsTrigger>
              <TabsTrigger value="clients">Clients List</TabsTrigger>
              <TabsTrigger value="fees">Fees and Charges</TabsTrigger>
            </TabsList>
            
            {/* Transactions Statement Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transactions Statement</CardTitle>
                  <CardDescription>
                    Detailed statement of all transactions on the Liquidity Rail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount (UGX)</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>{transaction.clientName}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {transaction.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Clients List Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Clients List</CardTitle>
                  <CardDescription>
                    List of all clients registered on the Liquidity Rail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Account Number</TableHead>
                        <TableHead>Date Onboarded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Balance (UGX)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>{client.clientName}</TableCell>
                          <TableCell>{client.accountNumber}</TableCell>
                          <TableCell>{client.dateOnboarded}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              client.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {client.status}
                            </span>
                          </TableCell>
                          <TableCell>{client.totalBalance.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Fees and Charges Tab */}
            <TabsContent value="fees">
              <Card>
                <CardHeader>
                  <CardTitle>Fees and Charges</CardTitle>
                  <CardDescription>
                    All fees and charges applied on the Liquidity Rail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyFeesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="fees" name="Fees Collected (UGX)" fill="#007AFF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div> */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fee Name</TableHead>
                        <TableHead>Fee Amount</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Applicable To</TableHead>
                        <TableHead>Date Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feesData.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.feeName}</TableCell>
                          <TableCell>
                            {fee.feeType === "Fixed" 
                              ? `${fee.feeAmount.toLocaleString()} UGX` 
                              : `${fee.feeAmount}%`
                            }
                          </TableCell>
                          <TableCell>{fee.feeType}</TableCell>
                          <TableCell>{fee.applicableTo}</TableCell>
                          <TableCell>{fee.dateCreated}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}