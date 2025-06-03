"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  WalletIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  ChevronDownIcon,
  ChartBarIcon,
  DocumentCurrencyDollarIcon,
} from "@heroicons/react/24/outline"

import BavaPayLogo from "../BavaPayLogo"

const menuItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/admin/dashboard" },
  { name: "Wallet", icon: WalletIcon, path: "/admin/wallet" },
  { name: "Transactions", icon: ClipboardDocumentListIcon, path: "/admin/transactions" },
  {
    name: "Deposits",
    icon: BanknotesIcon,
    submenu: [
      { name: "Make Deposit", path: "/admin/deposits/make" },
      { name: "Pending Deposits", path: "/admin/deposits/pending" },
    ],
  },
  {
    name: "Business",
    icon: UsersIcon,
    submenu: [
      { name: "Business List", path: "/admin/business/businesslist" },
      { name: "Add Business", path: "/admin/business/addbusiness" },
      { name: "Fee Products", path: "/admin/fees/products" },
    ],
  },
  {
    name: "Users",
    icon: UsersIcon,
    submenu: [
      { name: "Users List", path: "/admin/users/list" },
      { name: "Add User", path: "/admin/users/add" },
    ],
  },
  { name: "Roles", icon: UsersIcon, path: "/admin/roles" },
  {
    name: "Reports",
    icon: ChartBarIcon,
    submenu: [
      {
        name: "Liquidity Rail",
        submenu: [
          { name: "Transactions", path: "/admin/reports/liquidity-rail?tab=transactions" },
          { name: "Clients", path: "/admin/reports/liquidity-rail?tab=clients" },
          { name: "Providers", path: "/admin/reports/liquidity-rail?tab=providers" },
          { name: "Fees", path: "/admin/reports/liquidity-rail?tab=fees" },
        ],
      },
      { name: "Volume", path: "/admin/reports/volume" },
      { name: "Collections", path: "/admin/reports/collections-report" },
      { name: "Payout", path: "/admin/reports/payout-report" },
      { name: "Charges", path: "/admin/reports/charges-report" },
      { name: "Wallets", path: "/admin/reports/wallet-report" },
    ],
  },/* 
  {
    name: "Fees",
    icon: DocumentCurrencyDollarIcon,
    path: "/admin/fees",
  }, */
  { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const isActive = (path: string) => {
    // For exact matches including query parameters
    return pathname === path
  }

  const renderMenuItem = (item: any) => {
    if (item.submenu) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleDropdown(item.name)}
            className="w-full text-left text-gray-700 hover:bg-[#26a0ff] hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
          >
            <item.icon
              className="text-gray-400 group-hover:text-white mr-3 flex-shrink-0 h-6 w-6"
              aria-hidden="true"
            />
            {item.name}
            <ChevronDownIcon
              className={`ml-auto h-5 w-5 transform transition-transform duration-200 ${
                openDropdowns.includes(item.name) ? "rotate-180" : ""
              }`}
            />
          </button>
          {openDropdowns.includes(item.name) && (
            <div className="ml-8 mt-2 space-y-1">
              {item.submenu.map((subItem: any) => {
                if (subItem.submenu) {
                  return (
                    <div key={subItem.name}>
                      <button
                        onClick={() => toggleDropdown(subItem.name)}
                        className="w-full text-left text-gray-700 hover:bg-[#26a0ff] hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                      >
                        {subItem.name}
                        <ChevronDownIcon
                          className={`ml-auto h-5 w-5 transform transition-transform duration-200 ${
                            openDropdowns.includes(subItem.name) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdowns.includes(subItem.name) && (
                        <div className="ml-8 mt-2 space-y-1">
                          {subItem.submenu.map((nestedItem: any) => (
                            <Link
                              key={nestedItem.name}
                              href={nestedItem.path}
                              className={`${
                                isActive(nestedItem.path)
                                  ? "bg-[#26a0ff] text-white"
                                  : "text-gray-700 hover:bg-[#26a0ff] hover:text-white"
                              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                              {nestedItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.path}
                    className={`${
                      isActive(subItem.path)
                        ? "bg-[#26a0ff] text-white"
                        : "text-gray-700 hover:bg-[#26a0ff] hover:text-white"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    {subItem.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
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
    )
  }

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex items-center h-16 flex-shrink-0 px-4">
            <BavaPayLogo className="mx-auto h-12 w-auto" />
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto bg-white">
            <nav className="flex-1 px-2 py-4 space-y-1">{menuItems.map(renderMenuItem)}</nav>
          </div>
        </div>
      </div>
    </div>
  )
}