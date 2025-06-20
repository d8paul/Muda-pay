"use client"

import { useState } from "react";
import WithdrawPanel from "@/components/WithdrawPanel";
import LiqPay from "@/components/LiqPay";
import StableCoinDeposit from "@/components/StableCoinDeposit";
import { X } from "lucide-react";

interface DepositComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositComponent({ isOpen, onClose }: DepositComponentProps) {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } z-40`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 sm:px-6 py-4 border-b flex justify-between items-center bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl text-foreground">Deposit</h2>
              <p className="text-sm text-muted-foreground">Add funds to your account</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-background to-muted/20">
            <StableCoinDeposit 
              onReset={onClose}
              showCurrencySelect={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
