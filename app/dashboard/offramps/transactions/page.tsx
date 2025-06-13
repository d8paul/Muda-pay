"use client"

import { useState } from "react";
import WithdrawPanel from "@/components/WithdrawPanel";
import LiqPay from "@/components/LiqPay";
import DepositComponent from "@/app/dashboard/stablecoins/DepositComponent";
export default function StableCoinsPage() {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLiqPayOpen, setIsLiqPayOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Stable Coins Transactions</h1>
        
        </div>

        {/* Transactions Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    2024-01-13
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Buy
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    USDT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    USDC
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $1,000.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $1.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    2024-01-12
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Sell
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    BUSD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    USDT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $500.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $0.50
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    2024-01-11
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Buy
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    USDT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    DAI
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $2,500.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $2.50
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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