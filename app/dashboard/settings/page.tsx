"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyInfoTab from "./components/company-info-tab";
import ApiKeysTab from "./components/api-keys-tab";
import IpsWebhookTab from "./components/ips-webhook-tab";
import AccountTab from "./components/account-tab";
import DepositFloatTab from "./components/deposit-float-tab";
import { Suspense } from "react";

// Client component that uses useSearchParams 
const SettingsPageContent = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam && ["company", "api", "account", "deposit"].includes(tabParam) ? tabParam : "company");

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ["company", "api", "account", "deposit"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b border-gray-200">
              <TabsList className="bg-transparent w-full flex h-auto p-0 border-0">
                <TabsTrigger 
                  value="company" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  Company Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="api" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  API Keys
                </TabsTrigger>
                <TabsTrigger 
                  value="ips" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  IPs & Webhooks
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  Account Security
                </TabsTrigger>
                <TabsTrigger 
                  value="deposit" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#26a0ff] data-[state=active]:border-b-2 data-[state=active]:border-[#26a0ff] rounded-none h-full text-sm font-medium"
                >
                  Deposit Float
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="company" className="mt-0">
                <div className="border-b pb-5 mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Company Profile</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View your company information and business details.
                  </p>
                </div>
                <CompanyInfoTab />
              </TabsContent>

              <TabsContent value="api" className="mt-0">
                <div className="border-b pb-5 mb-6">
                  <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage your Testing and Live API keys.
                  </p>
                </div>
                <ApiKeysTab />
              </TabsContent>

              <TabsContent value="ips" className="mt-0">
                <div className="border-b pb-5 mb-6">
                  <h3 className="text-lg font-medium text-gray-900">IPs & Webhooks</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage your IP Address whitelist and webhook endpoints for integrations.
                  </p>
                </div>
                <IpsWebhookTab />
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <div className="border-b pb-5 mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Account Security</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage your account security settings and authentication options.
                  </p>
                </div>
                <AccountTab />
              </TabsContent>
              
              <TabsContent value="deposit" className="mt-0">
                <div className="border-b pb-5 mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Deposit Float</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Deposit funds to your float account using bank transfer or cryptocurrency.
                  </p>
                </div>
                <DepositFloatTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}