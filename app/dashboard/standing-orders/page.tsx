"use client"

import { useState } from "react"

const initialStandingOrders = [
  { id: 1, recipient: "John Doe", amount: 100000, frequency: "Monthly", nextPayment: "2023-07-01" },
  { id: 2, recipient: "Jane Smith", amount: 50000, frequency: "Weekly", nextPayment: "2023-06-25" },
  { id: 3, recipient: "Bob Johnson", amount: 75000, frequency: "Bi-weekly", nextPayment: "2023-07-05" },
]

export default function StandingOrdersPage() {
  const [standingOrders, setStandingOrders] = useState(initialStandingOrders)
  const [showModal, setShowModal] = useState(false)
  const [newOrder, setNewOrder] = useState({ recipient: "", amount: "", frequency: "Monthly", nextPayment: "" })

  const handleCreateOrder = () => {
    setStandingOrders([...standingOrders, { ...newOrder, id: standingOrders.length + 1 }])
    setShowModal(false)
    setNewOrder({ recipient: "", amount: "", frequency: "Monthly", nextPayment: "" })
  }

  const handleDeleteOrder = (id: number) => {
    setStandingOrders(standingOrders.filter((order) => order.id !== id))
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Standing Orders</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Standing Order
            </button>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {standingOrders.map((order) => (
                <li key={order.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">{order.recipient}</p>
                        <p className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="truncate">UGX {order.amount.toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <p className="text-sm text-gray-600">{order.frequency}</p>
                        <p className="mt-1 text-sm text-gray-500">Next payment: {order.nextPayment}</p>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

