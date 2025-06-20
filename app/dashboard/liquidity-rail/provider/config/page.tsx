"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProviderConfigPage() {
  const [isActive, setIsActive] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const services = [
    "Mobile Money",
    "Bank Transfer",
    "Cash Pickup",
    "Card Payment"
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Provider Configuration</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                id="provider-status"
              />
              <Label htmlFor="provider-status">
                {isActive ? "Active" : "Inactive"}
              </Label>
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
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Switch
                    checked={selectedServices.includes(service)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedServices([...selectedServices, service]);
                      } else {
                        setSelectedServices(selectedServices.filter(s => s !== service));
                      }
                    }}
                    id={`service-${service}`}
                  />
                  <Label htmlFor={`service-${service}`}>{service}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-[#26a0ff] hover:bg-[#1f8ad8]">
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
} 