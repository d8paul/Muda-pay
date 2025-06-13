"use client";

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AccountBalanceWallet, NetworkCheck } from '@mui/icons-material';
import StableCoinsPage from "@/app/dashboard/stablecoins/page";

// Mock data - replace with actual data from your API
const mockWallets = [
  { id: 1, address: '0x1234...5678', balance: '1,234.56', network: 'BSC' },
  { id: 2, address: '0x8765...4321', balance: '2,345.67', network: 'Tron' },
  { id: 3, address: '0x9876...1234', balance: '3,456.78', network: 'Stellar' },
];

const networks = [
  { value: 'bsc', label: 'BSC', icon: '🔶' },
  { value: 'tron', label: 'Tron', icon: '🔷' },
  { value: 'stellar', label: 'Stellar', icon: '⭐' },
];

export default function LiquidityPage() {
  const [selectedNetwork, setSelectedNetwork] = useState('bsc');
  const totalBalance = '7,037.01'; // Replace with actual calculation

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Addresses</h1>

        
      </div>

      <div className="grid gap-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <AccountBalanceWallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Total Balance</p>
                  <p className="text-2xl font-bold tracking-tight mt-2 text-primary">
                    ${totalBalance}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <NetworkCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Active Networks</p>
                  <p className="text-2xl font-bold tracking-tight mt-2 text-primary">
                    {networks.length}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <AccountBalanceWallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Active Wallets</p>
                  <p className="text-2xl font-bold tracking-tight mt-2 text-primary">
                    {mockWallets.length}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <NetworkCheck className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.value} value={network.value}>
                      <div className="flex items-center gap-2">
                        <span>{network.icon}</span>
                        <span>{network.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold tracking-tight">Wallets</h2>
            <p className="text-sm text-muted-foreground">
              Your active wallets and their balances
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockWallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">{wallet.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{networks.find(n => n.label === wallet.network)?.icon}</span>
                        <span>{wallet.network}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{wallet.address}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${wallet.balance}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 