"use client"

import { useState, useEffect } from "react"
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
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline"

import BavaPayLogo from "../BavaPayLogo"

const menuItems = [
  { 
    name: "Dashboard", 
    icon: HomeIcon, 
    submenu: [
      { name: "Overview", path: "/admin/dashboard" },
      { name: "Transactions", path: "/admin/transactions" },
    ]
  },
  { name: "Wallet", icon: WalletIcon, path: "/admin/wallet" },
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
      { name: "Add Business", path: "/admin/business/addbusiness" }
   
    ],
  },
  {
    name: "System Users",
    icon: UsersIcon,
    submenu: [
      { name: "Users List", path: "/admin/users/list" },
      { name: "Add User", path: "/admin/users/add" },
      { name: "Pending Users", path: "/admin/users/pending" },
      {
        name: "Roles",
        submenu: [
          { name: "All Roles", path: "/admin/roles" },
          { name: "Add Role", path: "/admin/roles/add" },
          { name: "Pending Roles", path: "/admin/roles/pending" },
        ],
      },
    ],
  },
  {
    name: "Rates",
    icon: CurrencyDollarIcon,
    submenu: [
      { name: "Rates", path: "/admin/rates" },
      { name: "Pending Rates", path: "/admin/rates/pending" },
    ],
  },
 {
    name: "Fees",
    icon: DocumentCurrencyDollarIcon,
    submenu: [
      { name: "Liquidity rail fees", path: "/admin/reports/liquidity-rail?tab=fees" },
      { name: "Fee Products", path: "/admin/fees/products" }
    ],
  }, 
  {
    name: "Liquidity Rail",
    icon: BanknotesIcon,
    submenu: [
      { name: "Transactions", path: "/admin/reports/liquidity-rail?tab=transactions" },
      { name: "Clients", path: "/admin/reports/liquidity-rail?tab=clients" },
      { name: "Providers", path: "/admin/reports/liquidity-rail?tab=providers" },
      /* { name: "Fees", path: "/admin/reports/liquidity-rail?tab=fees" }, */
    ],
  },
  {
    name: "Reports",
    icon: ChartBarIcon,
    submenu: [
      {
        name: "Profit and Loss",
        submenu: [
          { name: "Muda Pay", path: "/admin/reports/profit-loss?tab=mudapay" },
          { name: "Liquidity Rail", path: "/admin/reports/profit-loss?tab=liquidityrail" }
        ],
      },
      { name: "Volume", path: "/admin/reports/volume" },
      { name: "Collections", path: "/admin/reports/collections-report" },
      { name: "Payout", path: "/admin/reports/payout-report" },
      { name: "Wallets", path: "/admin/reports/wallet-report" },
    ],
  },
  { name: "Settings", icon: Cog6ToothIcon, path: "/admin/settings" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  const isActive = (path: string) => {
    if (path.includes('?')) {
      // For paths with query parameters, check if current pathname and search params match
      const [pathPart, queryPart] = path.split('?')
      return pathname === pathPart && (typeof window !== 'undefined' && window.location.search.includes(queryPart))
    }
    return pathname === path
  }

  const isChildActive = (item: any): boolean => {
    if (!item.submenu) return false
    
    return item.submenu.some((subItem: any) => {
      if (subItem.submenu) {
        return subItem.submenu.some((nestedItem: any) => isActive(nestedItem.path))
      }
      return isActive(subItem.path)
    })
  }

  // Auto-open dropdowns if a child item is active
  useEffect(() => {
    const activeDropdowns: string[] = []
    menuItems.forEach((item) => {
      if (isChildActive(item)) {
        activeDropdowns.push(item.name)
        // Also check for nested submenus
        if (item.submenu) {
          item.submenu.forEach((subItem: any) => {
            if (subItem.submenu && subItem.submenu.some((nested: any) => isActive(nested.path))) {
              activeDropdowns.push(subItem.name)
            }
          })
        }
      }
    })
    if (activeDropdowns.length > 0) {
      setOpenDropdowns(activeDropdowns)
    }
  }, [pathname])

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const renderMenuItem = (item: any) => {
    if (item.submenu) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleDropdown(item.name)}
            className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isChildActive(item)
                ? "bg-[#26a0ff] text-white"
                : "text-gray-700 hover:bg-[#26a0ff] hover:text-white"
            }`}
          >
            <item.icon
              className={`mr-3 flex-shrink-0 h-6 w-6 ${
                isChildActive(item)
                  ? "text-white"
                  : "text-gray-400 group-hover:text-white"
              }`}
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