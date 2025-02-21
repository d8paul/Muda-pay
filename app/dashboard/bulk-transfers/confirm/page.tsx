"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BulkTransfersConfirmPage() {
  const [fileContents, setFileContents] = useState<string[][]>([])
  const router = useRouter()

  useEffect(() => {
    // In a real application, you would fetch the file contents from a server or state management solution
    // For this example, we'll use mock data
    const mockData = [
      ["Recipient", "Amount", "Currency", "Description"],
      ["John Doe", "1000", "UGX", "Salary payment"],
      ["Jane Smith", "500", "UGX", "Reimbursement"],
      ["Bob Johnson", "750", "UGX", "Contractor fee"],
    ]
    setFileContents(mockData)
  }, [])

  const handleConfirm = () => {
    // Here you would typically process the transfers
    console.log("Processing transfers:", fileContents)
    // Redirect to a success page or back to the bulk transfers page
    router.push("/dashboard/bulk-transfers")
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Confirm Bulk Transfers</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Review Transfers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {fileContents[0]?.map((header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fileContents.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Confirm and Process Transfers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

