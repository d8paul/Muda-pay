"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProgressBar from "@/components/ui/progress-bar";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for reports
const tradeData = [
  { id: 1, date: "2025-04-25", volume: 2500000, cost: 150000, spread: 1.2, profit: 300000, currency: "UGX" },
  { id: 2, date: "2025-04-26", volume: 3200000, cost: 190000, spread: 1.1, profit: 352000, currency: "UGX" },
  { id: 3, date: "2025-04-27", volume: 1800000, cost: 120000, spread: 1.3, profit: 234000, currency: "UGX" },
  { id: 4, date: "2025-04-28", volume: 4500000, cost: 230000, spread: 1.0, profit: 450000, currency: "UGX" },
];

const volumeData = [
  { month: "Jan", volume: 1450000 },
  { month: "Feb", volume: 1820000 },
  { month: "Mar", volume: 1930000 },
  { month: "Apr", volume: 2100000 },
];

const userData = [
  { month: "Jan", users: 125 },
  { month: "Feb", users: 156 },
  { month: "Mar", users: 189 },
  { month: "Apr", users: 214 },
];

const reconciliationData = [
  { id: 1, accountName: "Main Operational Account", balance: 450000000, pendingDeposits: 32000000, pendingWithdrawals: 18000000, adjustedBalance: 464000000, currency: "UGX" },
  { id: 2, accountName: "Settlement Account", balance: 235000000, pendingDeposits: 15000000, pendingWithdrawals: 22000000, adjustedBalance: 228000000, currency: "UGX" },
  { id: 3, accountName: "Reserve Account", balance: 780000000, pendingDeposits: 0, pendingWithdrawals: 0, adjustedBalance: 780000000, currency: "UGX" },
  { id: 4, accountName: "Transaction Fee Account", balance: 132000000, pendingDeposits: 5000000, pendingWithdrawals: 0, adjustedBalance: 137000000, currency: "UGX" },
];

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("month");

  // Calculate totals for summary cards
  const totalVolume = tradeData.reduce((sum, item) => sum + item.volume, 0);
  const totalProfit = tradeData.reduce((sum, item) => sum + item.profit, 0);
  const averageSpread = tradeData.reduce((sum, item) => sum + item.spread, 0) / tradeData.length;
  const totalUsers = userData[userData.length - 1].users;
  
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {totalVolume.toLocaleString()} UGX
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {totalProfit.toLocaleString()} UGX
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Average Spread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {averageSpread.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {totalUsers}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <Label htmlFor="timeRange">Time Range:</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger id="timeRange" className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
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
              <Card>
                <CardHeader>
                  <CardTitle>Profit on Trades</CardTitle>
                  <CardDescription>
                    Detailed breakdown of trade volumes, costs, spreads and profit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={tradeData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="volume" name="Volume" fill="#4A90E2" />
                        <Bar dataKey="profit" name="Profit" fill="#007AFF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div> */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Volume (UGX)</TableHead>
                        <TableHead>Cost (UGX)</TableHead>
                        <TableHead>Spread (%)</TableHead>
                        <TableHead>Profit (UGX)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tradeData.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell>{trade.date}</TableCell>
                          <TableCell>{trade.volume.toLocaleString()}</TableCell>
                          <TableCell>{trade.cost.toLocaleString()}</TableCell>
                          <TableCell>{trade.spread}%</TableCell>
                          <TableCell>{trade.profit.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Volume Report Tab */}
            <TabsContent value="volume">
              <Card>
                <CardHeader>
                  <CardTitle>Volume Report</CardTitle>
                  <CardDescription>
                    Total transaction volume over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={volumeData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="volume" name="Volume" fill="#9b87f5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div> */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Volume (UGX)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volumeData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell>{item.volume.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* User Growth Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
                    Number of users over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="users" name="Users" fill="#9b87f5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Number of Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell>{item.users}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Account Reconciliation Tab */}
            <TabsContent value="reconciliation">
              <Card>
                <CardHeader>
                  <CardTitle>Account Reconciliation</CardTitle>
                  <CardDescription>
                    Reconciliation of all accounts with pending transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Current Balance</TableHead>
                        <TableHead>Pending Deposits</TableHead>
                        <TableHead>Pending Withdrawals</TableHead>
                        <TableHead>Adjusted Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciliationData.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell>{account.balance.toLocaleString()} {account.currency}</TableCell>
                          <TableCell>{account.pendingDeposits.toLocaleString()} {account.currency}</TableCell>
                          <TableCell>{account.pendingWithdrawals.toLocaleString()} {account.currency}</TableCell>
                          <TableCell>{account.adjustedBalance.toLocaleString()} {account.currency}</TableCell>
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