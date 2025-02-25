"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BanknotesIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/currency";
import { get } from "@/utils/api";
import ProgressBar from "@/components/ProgressBar";
import TableWithPagination from "@/components/ui/TableWithPagination";

const columns = [
  { key: "created_at", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "asset_code", label: "Currency" },
  { key: "product_id", label: "Product ID" },
  { key: "receiver_account", label: "Receiver Account" },
  { key: "status", label: "Status" }
];

export default function DashboardPage() {
  const [selectedCurrency, setSelectedCurrency] = useState({ code: "UGX" });
  const [transactions, setTransactions] = useState([]);
  interface Stat {
    name: string;
    value: any;
    isCurrency: boolean;
    icon: string;
    change: string;
    changeType: string;
  }

  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedCurrency = localStorage.getItem("selectedCurrency");
    if (storedCurrency) {
      setSelectedCurrency(JSON.parse(storedCurrency));
    }

    const fetchData = async () => {
      try {
        const [transactionsResponse, statsResponse] = await Promise.all([
          get("payment/statement"),
          get("clients/get-stats"),
        ]);

        setTransactions(transactionsResponse.data);
        setStats([
          { name: "Number of transactions", value: statsResponse.data.revenue, isCurrency: false, icon: "BanknotesIcon", change: "+5%", changeType: "increase" },
          { name: "Collections", value: statsResponse.data.collections, isCurrency: true, icon: "ShoppingCartIcon", change: "-2%", changeType: "decrease" },
          { name: "Payouts", value: statsResponse.data.payouts, isCurrency: true, icon: "ArrowDownIcon", change: "+1%", changeType: "increase" },
          { name: "Revenue", value: statsResponse.data.revenue - statsResponse.data.payouts, isCurrency: true, icon: "ArrowUpIcon", change: "+8%", changeType: "increase" },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {item.icon === "BanknotesIcon" && <BanknotesIcon className="h-6 w-6 text-gray-400" />}
                        {item.icon === "ArrowDownIcon" && <ArrowDownIcon className="h-6 w-6 text-gray-400" />}
                        {item.icon === "ShoppingCartIcon" && <ShoppingCartIcon className="h-6 w-6 text-gray-400" />}
                        {item.icon === "ArrowUpIcon" && <ArrowUpIcon className="h-6 w-6 text-gray-400" />}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {item.isCurrency ? formatCurrency(item.value, selectedCurrency.code) : item.value}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <span className={`font-medium ${item.changeType === "increase" ? "text-green-600" : "text-red-600"}`}>{item.change}</span>{" "}
                      <span className="text-gray-500">{item.changeType === "increase" ? "increase" : "decrease"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h2>
                <div className="mt-5">
                  <TableWithPagination data={transactions} columns={columns} itemsPerPage={10} />
                </div>
                <div className="mt-5">
                  <Link href="/dashboard/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all transactions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}