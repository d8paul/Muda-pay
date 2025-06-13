"use client"

import { useState } from "react";
import WithdrawPanel from "@/components/WithdrawPanel";
import LiqPay from "@/components/LiqPay";
import DepositComponent from "./DepositComponent";
export default function StableCoinsPage() {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLiqPayOpen, setIsLiqPayOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <>
      <div >
        <div className="flex justify-between items-center mb-6">
           <div className="flex gap-4">
            <button
              className="px-6 py-2 bg-[#26a0ff] text-white rounded-md hover:bg-[#1a88e8] transition-colors"
              onClick={() => setIsDepositOpen(true)}
            >
              Deposit
            </button>
            <button
              className="px-6 py-2 bg-[#26a0ff] text-white rounded-md hover:bg-[#1a88e8] transition-colors"
              onClick={() => setIsWithdrawOpen(true)}
            >
              Withdraw
            </button>
            <button
              className="px-6 py-2 bg-[#26a0ff] text-white rounded-md hover:bg-[#1a88e8] transition-colors"
              onClick={() => setIsLiqPayOpen(true)}
            >
              Send Funds
            </button>
          </div>
        </div>

       
      </div>
      <DepositComponent 
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      {/* Withdraw Panel */}
      <WithdrawPanel 
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
      <LiqPay
        isOpen={isLiqPayOpen}
        onClose={() => setIsLiqPayOpen(false)}
      />
    </>
  );
} 