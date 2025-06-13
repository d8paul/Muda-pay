"use client";

import React, { useEffect, useState } from 'react';
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
import { AccountBalanceWallet, NetworkCheck, Payment } from '@mui/icons-material';
import StableCoinsPage from "@/app/dashboard/stablecoins/page";
import { get, post } from '@/utils/api';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Balance {
  balance: string;
  currency: string;
  issuer: string;
  id: string;
  asset_code: string;
  network: string;
}

interface PaymentMethod {
  id: number;
  payment_method_id: string;
  company_id: string;
  kotani_customer_key: string;
  type: "mobile_money" | "bank";
  currency: string;
  phone_number?: string;
  country_code: string;
  network?: string;
  account_name: string;
  bank_name?: string | null;
  bank_code?: string | null;
  account_number?: string | null;
  bank_address?: string | null;
  bank_phone_number?: string | null;
  bank_country?: string | null;
  sort_code?: string | null;
  swift_code?: string | null;
  created_at: string;
  updated_at: string;
}

interface Provider {
  provider_service_id: number;
  service_id: number;
  provider_id: number;
  min_amount: number;
  max_amount: number;
  name: string;
  approval_status: string;
  service_code: string;
  service_name: string;
  country: string;
  currency: string;
  provider_type: string;
  rate: number;
}

export default function LiquidityPage() {
  const router = useRouter();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState('USDT');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balancesResponse, methodsResponse] = await Promise.all([
          get('clients/balances'),
          get('web/rail/accounts/getPaymentMethods')
        ]);

        if (balancesResponse.status === 200) {
          setBalances(balancesResponse.data);
        }
        if (methodsResponse.status === 200) {
          setPaymentMethods(methodsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      if (selectedAsset) {
        try {
          const response = await post('rail/accounts/provider', {
            asset: selectedAsset,
            currency: paymentMethods[0]?.currency || 'UGX'
          });
          if (response.status === 200) {
            setProviders(response.data);
          }
        } catch (error) {
          console.error('Error fetching providers:', error);
        }
      }
    };

    if (paymentMethods.length > 0) {
      fetchProviders();
    }
  }, [selectedAsset, paymentMethods]);

  const totalBalance = balances.reduce((sum, balance) => {
    return sum + parseFloat(balance.balance || '0');
  }, 0).toFixed(2);

  const activeNetworks = balances.filter(balance => parseFloat(balance.balance) > 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-[1400px]">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Liquidity</h1>
        <div className="flex flex-row gap-4 justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Manage your liquidity across different networks
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/settings/payment-methods')}
            >
              <Payment className="h-4 w-4 mr-2" />
              Payment Methods
            </Button>
            <StableCoinsPage />
          </div>
        </div>
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
                    {activeNetworks.length}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Payment className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Payment Methods</p>
                  <p className="text-2xl font-bold tracking-tight mt-2 text-primary">
                    {paymentMethods.length}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold tracking-tight">Available Rates</h2>
            <p className="text-sm text-muted-foreground">
              Current exchange rates for your payment methods
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select
                value={selectedAsset}
                onValueChange={setSelectedAsset}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Limits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.provider_service_id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>{provider.service_name}</TableCell>
                    <TableCell>{provider.currency}</TableCell>
                    <TableCell className="text-right">
                      1 {selectedAsset} = {provider.rate.toFixed(2)} {provider.currency}
                    </TableCell>
                    <TableCell className="text-right">
                      {provider.min_amount} - {provider.max_amount} {selectedAsset}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold tracking-tight">Your Payment Methods</h2>
            <p className="text-sm text-muted-foreground">
              Available withdrawal methods
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {method.type === 'mobile_money' ? 'Mobile Money' : 'Bank Account'}
                    </TableCell>
                    <TableCell>
                      {method.type === 'mobile_money'
                        ? `${method.network} - ${method.phone_number}`
                        : `${method.bank_name}`}
                    </TableCell>
                    <TableCell>{method.currency}</TableCell>
                    <TableCell>{method.country_code}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                  <TableHead>Network</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((wallet) => (
                  (wallet.asset_code === 'USDT' || wallet.asset_code === 'USDC' || wallet.asset_code === 'BUSD') && (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{wallet.network}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{wallet.currency}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${wallet.balance}
                      </TableCell>
                    </TableRow>
                  )
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 