"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CreditCardIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ShoppingBagIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { formatCurrency } from "@/utils/currency";
import { get } from "@/utils/api";
import ProgressBar from "@/components/ProgressBar";
import TableWithPagination from "@/components/ui/TableWithPagination";
import { Skeleton } from "@/components/ui/skeleton";

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
    iconColor: string;
    bgColor: string;
  }

  const [stats, setStats] = useState<Stat[]>([
    { name: "Number of transactions", value: null, isCurrency: false, icon: "CreditCardIcon", iconColor: "text-blue-500", bgColor: "bg-blue-50" },
    { name: "Collections", value: null, isCurrency: true, icon: "ShoppingBagIcon", iconColor: "text-green-500", bgColor: "bg-green-50" },
    { name: "Payouts", value: null, isCurrency: true, icon: "ArrowDownCircleIcon", iconColor: "text-purple-500", bgColor: "bg-purple-50" },
  ]);
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
        
        // Update stats with actual values
        setStats(prevStats => prevStats.map(stat => {
          if (stat.name === "Number of transactions") {
            return { ...stat, value: statsResponse.data.transactions_count || 0 };
          } else if (stat.name === "Collections") {
            return { ...stat, value: statsResponse.data.collections || 0 };
          } else if (stat.name === "Payouts") {
            return { ...stat, value: statsResponse.data.payouts || 0 };
          }
          return stat;
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case "CreditCardIcon":
        return <CreditCardIcon className={`h-8 w-8 ${colorClass}`} />;
      case "ShoppingBagIcon":
        return <ShoppingBagIcon className={`h-8 w-8 ${colorClass}`} />;
      case "ArrowDownCircleIcon":
        return <ArrowDownCircleIcon className={`h-8 w-8 ${colorClass}`} />;
      case "ArrowTrendingUpIcon":
        return <ArrowTrendingUpIcon className={`h-8 w-8 ${colorClass}`} />;
      default:
        return <CircleStackIcon className={`h-8 w-8 ${colorClass}`} />;
    }
  };

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
                <div 
                  key={item.name} 
                  className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 p-3 rounded-full ${item.bgColor}`}>
                        {renderIcon(item.icon, item.iconColor)}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                          <dd>
                            {isLoading ? (
                              <Skeleton className="h-7 w-24 mt-1" />
                            ) : (
                              <div className="text-xl font-bold text-gray-900">
                                {item.isCurrency ? formatCurrency(item.value, selectedCurrency.code) : item.value}
                              </div>
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg border border-gray-200">
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