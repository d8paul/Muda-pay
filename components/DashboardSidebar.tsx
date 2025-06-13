"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  WalletIcon,
  ClipboardDocumentListIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  ClockIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import BavaPayLogo from './BavaPayLogo';
import { Money, MoneyOff, AccountBalanceWallet, Payment } from "@mui/icons-material";

const menuItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Wallet", icon: WalletIcon, path: "/dashboard/wallet" },
  { name: "Collections", icon: Money, path: "/dashboard/collections" },
  { name: "Payouts", icon: MoneyOff, path: "/dashboard/payouts" },
  { 
    name: "Liquidity Rail", 
    icon: BanknotesIcon, 
    path: "/dashboard/offramps",
    subItems: [
      { name: "Wallets", icon: AccountBalanceWallet, path: "/dashboard/offramps/liquidity" },
      { name: "Transactions", icon: ClipboardDocumentListIcon, path: "/dashboard/offramps/transactions" },
      { name: "Addresses", icon: CurrencyDollarIcon, path: "/dashboard/offramps/addresses" },
    ]
  },
  { 
    name: "Settings", 
    icon: Cog6ToothIcon, 
    path: "/dashboard/settings",
    subItems: [
      { name: "Payment Methods", icon: Payment, path: "/dashboard/settings/payment-methods" },
    ]
  },
  { name: "Developer Docs", icon: CodeBracketIcon, path: "https://payments-doc.muda.tech/", external: true },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [openOfframps, setOpenOfframps] = useState(true);
  const [openSettings, setOpenSettings] = useState(false);

  const handleOfframpsClick = () => {
    setOpenOfframps(!openOfframps);
  };

  const handleSettingsClick = () => {
    setOpenSettings(!openSettings);
  };

  const isActive = (path: string, isParent: boolean = false) => {
    if (isParent) {
      // For parent items, check if any child path is active
      const item = menuItems.find(item => item.path === path);
      if (item?.subItems) {
        return item.subItems.some(subItem => pathname === subItem.path);
      }
    }
    return pathname === path;
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white">
            <BavaPayLogo className="mx-auto h-12 w-auto" />
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto bg-white">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {menuItems.map((item) => {
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        isActive(item.path) ? "bg-[#26a0ff] text-white" : "text-gray-700 hover:bg-[#26a0ff] hover:text-white"
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-white"
                        } mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  );
                }

                if (item.subItems) {
                  const isParentActive = isActive(item.path, true);
                  const isOpen = item.name === "Liquidity Rail" ? openOfframps : item.name === "Settings" ? openSettings : false;
                  const toggleOpen = item.name === "Liquidity Rail" ? handleOfframpsClick : item.name === "Settings" ? handleSettingsClick : () => {};
                  
                  return (
                    <div key={item.name}>
                      <button
                        onClick={toggleOpen}
                        className={`${
                          isParentActive ? "bg-[#26a0ff] text-white" : "text-gray-700 hover:bg-[#26a0ff] hover:text-white"
                        } group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <item.icon
                          className={`${
                            isParentActive ? "text-white" : "text-gray-400 group-hover:text-white"
                          } mr-3 flex-shrink-0 h-6 w-6`}
                          aria-hidden="true"
                        />
                        {item.name}
                        <svg
                          className={`${
                            isOpen ? "transform rotate-180" : ""
                          } ml-auto h-5 w-5 text-gray-400 group-hover:text-white`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="pl-4 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.path}
                              className={`${
                                isActive(subItem.path) ? "bg-[#26a0ff] text-white" : "text-gray-700 hover:bg-[#26a0ff] hover:text-white"
                              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                              <subItem.icon
                                className={`${
                                  isActive(subItem.path) ? "text-white" : "text-gray-400 group-hover:text-white"
                                } mr-3 flex-shrink-0 h-6 w-6`}
                                aria-hidden="true"
                              />
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`${
                      isActive(item.path) ? "bg-[#26a0ff] text-white" : "text-gray-700 hover:bg-[#26a0ff] hover:text-white"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-white"
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}