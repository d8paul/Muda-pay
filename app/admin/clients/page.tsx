"use client"

import { useState } from "react"
import ProgressBar from "@/components/ProgressBar"
import { Switch } from "@/components/ui/switch"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"
import { formatCurrency } from "@/utils/currency"

// Hardcoded data for clients and wallets
const clientsData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: true,
    joinedDate: "2023-01-15",
    wallets: [
      { id: 1, currency: "UGX", balance: 1000000 },
      { id: 2, currency: "USD", balance: 500 },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    status: false,
    joinedDate: "2023-02-20",
    wallets: [
      { id: 3, currency: "UGX", balance: 500000 },
      { id: 4, currency: "EUR", balance: 200 },
    ],
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    status: true,
    joinedDate: "2023-03-10",
    wallets: [
      { id: 5, currency: "UGX", balance: 750000 },
      { id: 6, currency: "USD", balance: 300 },
    ],
  },
]

export default function AdminClientsPage() {
  const [clients, setClients] = useState(clientsData)
  const [expandedClient, setExpandedClient] = useState<number | null>(null)
  const [filter, setFilter] = useState("")

  const toggleClientExpansion = (clientId: number) => {
    setExpandedClient(expandedClient === clientId ? null : clientId)
  }

  const toggleClientStatus = (clientId: number) => {
    setClients(clients.map((client) => (client.id === clientId ? { ...client, status: !client.status } : client)))
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(filter.toLowerCase()) ||
      client.email.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <>
      <ProgressBar isLoading={false} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Filter clients..."
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Joined Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(client.joinedDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Switch
                          checked={client.status}
                          onCheckedChange={() => toggleClientStatus(client.id)}
                          className="ml-4"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleClientExpansion(client.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {expandedClient === client.id ? (
                            <>
                              Hide Wallets <ChevronUpIcon className="inline-block ml-1 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Show Wallets <ChevronDownIcon className="inline-block ml-1 h-4 w-4" />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {expandedClient !== null && (
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Wallets for {clients.find((c) => c.id === expandedClient)?.name}
                </h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Currency
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients
                      .find((c) => c.id === expandedClient)
                      ?.wallets.map((wallet) => (
                        <tr key={wallet.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wallet.currency}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(wallet.balance, wallet.currency)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

