"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  WalletIcon,
  ClipboardDocumentListIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import BavaPayLogo from '../components/BavaPayLogo'

const menuItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Wallet", icon: WalletIcon, path: "/dashboard/wallet" },
  { name: "Transactions", icon: ClipboardDocumentListIcon, path: "/dashboard/transactions" },
  { name: "Bulk Transfers", icon: ArrowsRightLeftIcon, path: "/dashboard/bulk-transfers" },
  { name: "Standing Orders", icon: ClockIcon, path: "/dashboard/standing-orders" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/dashboard/settings" },
  { name: "Developer Docs", icon: CodeBracketIcon, path: "/dashboard/developer" },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          
          <BavaPayLogo className="mx-auto h-12 w-auto" />

          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`${
                      isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive ? "text-gray-300" : "text-gray-400 group-hover:text-gray-300"
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

