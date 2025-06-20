"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProviderPage({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine which tab is active based on the path
  let activeTab = "setup";
  if (pathname.endsWith("/transactions")) activeTab = "transactions";

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/liquidity-rail/provider/${tab}`);
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
} 