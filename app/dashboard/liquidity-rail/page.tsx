"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LiquidityRailPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/liquidity-rail/client/flow");
  }, [router]);

  return null;
} 