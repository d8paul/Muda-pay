"use client"

import { useState, useEffect } from "react"
import { get } from "@/utils/api"
import { Deposit } from "../types"

export function usePendingDeposits() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState<Deposit[]>([]);

  const fetchPendingDeposits = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching pending deposits...");
      const response = await get("/admin/pending-deposits");
      console.log("Pending deposits response:", response);
      
      // Handle different response structures
      if (response) {
        if (Array.isArray(response)) {
          setPendingDeposits(response);
        } else if (response.data && Array.isArray(response.data)) {
          setPendingDeposits(response.data);
        } else if (response.data) {
          // If response.data is not an array, wrap it in an array or set empty
          setPendingDeposits(Array.isArray(response.data) ? response.data : []);
        } else {
          setPendingDeposits([]);
        }
      } else {
        setPendingDeposits([]);
      }
      
      console.log("Deposits set successfully");
    } catch (error) {
      console.error("Error fetching pending deposits:", error);
      setPendingDeposits([]); // Set empty array on error
      // Error toast is automatically shown by the API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const removeDeposit = (transId: string) => {
    setPendingDeposits((prev) =>
      prev.filter((deposit) => deposit.trans_id !== transId)
    );
  };

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  return {
    isLoading,
    pendingDeposits,
    fetchPendingDeposits,
    removeDeposit
  };
}
