"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientFlowPage() {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const providers = [
    { id: "provider1", name: "Provider 1" },
    { id: "provider2", name: "Provider 2" },
    { id: "provider3", name: "Provider 3" },
  ];

  const services = [
    "Mobile Money",
    "Bank Transfer",
    "Cash Pickup",
    "Card Payment"
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Current Flow Configuration</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flow Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Select Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Select Service</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flow-name">Flow Name</Label>
              <Input
                id="flow-name"
                placeholder="Enter flow name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter flow description"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flow Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Minimum Amount</Label>
              <Input
                id="min-amount"
                type="number"
                placeholder="Enter minimum amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-amount">Maximum Amount</Label>
              <Input
                id="max-amount"
                type="number"
                placeholder="Enter maximum amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="processing-time">Processing Time (minutes)</Label>
              <Input
                id="processing-time"
                type="number"
                placeholder="Enter processing time"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline">
            Cancel
          </Button>
          <Button className="bg-[#26a0ff] hover:bg-[#1f8ad8]">
            Save Flow
          </Button>
        </div>
      </div>
    </div>
  );
} 