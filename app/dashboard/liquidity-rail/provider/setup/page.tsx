"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function ProviderSetupPage() {
  const [isActive, setIsActive] = useState(false);
  const [selectedServices, setSelectedServices] = useState({
    mobileMoney: false,
    bankTransfer: false,
    cashPickup: false,
    cardPayment: false
  });

  const toggleService = (service: keyof typeof selectedServices) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Provider Setup</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {isActive ? "Provider is currently active" : "Provider is currently inactive"}
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API Endpoint</Label>
              <Input
                id="api-endpoint"
                placeholder="Enter API endpoint URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="call-rates">Call Rates</Label>
              <Input
                id="call-rates"
                placeholder="Enter call rates"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mobile-money">Mobile Money</Label>
              <Switch
                id="mobile-money"
                checked={selectedServices.mobileMoney}
                onCheckedChange={() => toggleService('mobileMoney')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="bank-transfer">Bank Transfer</Label>
              <Switch
                id="bank-transfer"
                checked={selectedServices.bankTransfer}
                onCheckedChange={() => toggleService('bankTransfer')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="cash-pickup">Cash Pickup</Label>
              <Switch
                id="cash-pickup"
                checked={selectedServices.cashPickup}
                onCheckedChange={() => toggleService('cashPickup')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="card-payment">Card Payment</Label>
              <Switch
                id="card-payment"
                checked={selectedServices.cardPayment}
                onCheckedChange={() => toggleService('cardPayment')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline">
            Cancel
          </Button>
          <Button className="bg-[#26a0ff] hover:bg-[#1f8ad8]">
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
} 