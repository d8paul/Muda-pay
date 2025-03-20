"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/currency";
import { get, post } from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface IBalance {
  asset_code: string; // e.g. "cUGX"
  type: string;       // e.g. "Collections Balance (UGX)"
  amount: number;     // numeric amount
  currency: string;   // e.g. "UGX"
}

interface ITransaction {
  // define transaction fields if needed
}

export default function WalletPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [groupedBalances, setGroupedBalances] = useState<Record<string, IBalance[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Step 1 Modal (Transfer Modal): user enters amount + narration
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCurrency, setTransferCurrency] = useState(""); // e.g. "UGX"
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNarration, setTransferNarration] = useState("");

  // Step 2 Modal (Confirm Modal): user reviews details + enters PIN
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferPin, setTransferPin] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Create a promise that resolves after 1 second
        const delay = new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch data
        const [balanceResponse, transactionsResponse] = await Promise.all([
          get("clients/balances"),
          get("payment/statement"),
        ]);

        // Wait for both the data and the minimum delay
        await delay;

        // Convert raw balances into an IBalance array
        const processed = balanceResponse.data.map((balance: any) => {
          const isCollection = balance.asset_code.startsWith("c");
          const currency = balance.currency; // e.g. "UGX"
          const typeLabel = isCollection ? "Collections" : "Payout";

          return {
            asset_code: balance.asset_code,
            currency,
            type: `${typeLabel} Balance (${currency})`,
            amount: parseFloat(balance.balance || 0),
          } as IBalance;
        });

        // Group IBalance items by currency
        const grouped: Record<string, IBalance[]> = {};
        processed.forEach((item:any) => {
          const currency = item.currency;
          if (!grouped[currency]) {
            grouped[currency] = [];
          }
          grouped[currency].push(item);
        });

        setGroupedBalances(grouped);
        setTransactions(transactionsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Called when user clicks the "Transfer" button on a Collections row
  const openTransferModal = (balance: IBalance) => {
    // We'll send from "collection" to "payout" for this currency
    setTransferCurrency(balance.currency);
    setTransferAmount("");
    setTransferNarration("");
    setShowTransferModal(true);
  };

  // Step 1: user clicks "Next" in Transfer Modal -> open Confirm Modal
  const handleTransferNext = () => {
    // Optionally validate amount/narration
    if (!transferAmount.trim()) return;

    // close Transfer Modal, open Confirm Modal
    setShowTransferModal(false);
    setTransferPin("");
    setShowConfirmModal(true);
  };

  // Step 2: user clicks "Confirm" in Confirm Modal -> POST to request-swap
  const handleConfirmTransfer = async () => {
    if (!transferPin.trim()) return;

    try {
      await post("clients/request-swap", {
        from: "collection",
        to: "payout",
        currency: transferCurrency,
        amount: parseFloat(transferAmount),
        narration: transferNarration,
        pin: transferPin,
      });

      // close everything
      setShowConfirmModal(false);
      setTransferPin("");
      setTransferAmount("");
      setTransferNarration("");
      setTransferCurrency("");
      // Optionally re-fetch balances or show success message
      // ...
    } catch (error) {
      console.error("Error requesting swap:", error);
    }
  };

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Wallet</h1>
      </div>

      {isLoading ? (
        // Loading state
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <Skeleton className="h-7 w-64" />
                <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
            </div>
          </div>
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <Skeleton className="h-7 w-64" />
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Render actual wallet content when data is loaded
        <>
          {/* One card per currency */}
          {Object.entries(groupedBalances).map(([currency, balancesForCurrency]) => (
            <div key={currency} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  {/* Card Header */}
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Wallet Balances for {currency}
                    </h3>
                  </div>

                  {/* Balances List */}
                  <div className="border-t border-gray-200">
                    <dl>
                      {balancesForCurrency.map((balance, index) => (
                        <div
                          key={balance.type}
                          className={
                            index % 2 === 0
                              ? "bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                              : "bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                          }
                        >
                          <dt className="text-sm font-medium text-gray-500">{balance.type}</dt>
                          <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-1">
                            {formatCurrency(balance.amount, balance.currency)}
                          </dd>

                          {/* Transfer button only on Collections rows */}
                          {balance.type.startsWith("Collections Balance") && (
                            <div className="mt-2 sm:mt-0 text-right">
                              <button
                                onClick={() => openTransferModal(balance)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Transfer
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ----------------------------------------- */}
      {/* Transfer Modal (Step 1: Amount / Narration) */}
      {/* ----------------------------------------- */}
      {showTransferModal && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            {/* Spacer */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Transfer Funds
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Send from <strong>Collections</strong> to <strong>Payout</strong> for{" "}
                <strong>{transferCurrency}</strong>.
              </p>

              {/* Amount */}
              <input
                type="number"
                placeholder="Amount"
                className="mt-4 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />

              {/* Narration */}
              <input
                type="text"
                placeholder="Narration"
                className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={transferNarration}
                onChange={(e) => setTransferNarration(e.target.value)}
              />

              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
                  onClick={handleTransferNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* Confirmation Modal (Step 2: Confirm + PIN) */}
      {/* -------------------------------------------- */}
      {showConfirmModal && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="confirm-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="confirm-modal-title"
              >
                Confirm Transfer
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">
                  You're about to transfer <strong>{transferAmount}</strong> of{" "}
                  <strong>{transferCurrency}</strong> from <strong>Collections</strong> to{" "}
                  <strong>Payout</strong>.
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Narration: <strong>{transferNarration || "None"}</strong>
                </p>
                <p className="text-sm text-gray-700 font-semibold">Enter your PIN:</p>

                {/* PIN input */}
                <input
                  type="password"
                  placeholder="PIN"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value)}
                />
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
                  onClick={handleConfirmTransfer}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
