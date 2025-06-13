"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientPage({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine which tab is active based on the path
  let activeTab = "operations";
  if (pathname.endsWith("/history")) activeTab = "history";

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/liquidity-rail/client/${tab}`);
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
} 