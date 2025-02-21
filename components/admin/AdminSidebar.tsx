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
} from "@heroicons/react/24/outline"

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
  { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const isActive = (path: string) => pathname === path

  const renderMenuItem = (item: any) => {
    if (item.submenu) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleDropdown(item.name)}
            className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
          >
            <item.icon
              className="text-gray-400 group-hover:text-gray-300 mr-3 flex-shrink-0 h-6 w-6"
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
              {item.submenu.map((subItem: any) => (
                <Link
                  key={subItem.name}
                  href={subItem.path}
                  className={`${
                    isActive(subItem.path)
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  {subItem.name}
                </Link>
              ))}
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
          isActive(item.path) ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        <item.icon
          className={`${
            isActive(item.path) ? "text-gray-300" : "text-gray-400 group-hover:text-gray-300"
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
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <h2 className="text-lg font-medium text-white">BavaPay Admin</h2>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">{menuItems.map(renderMenuItem)}</nav>
          </div>
        </div>
      </div>
    </div>
  )
}

