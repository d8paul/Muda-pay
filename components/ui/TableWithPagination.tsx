import { useState } from "react"

interface Column {
  key: string
  label: string
  render?: (row: any) => JSX.Element | string
}

interface Props {
  data: any[]
  columns: Column[]
  itemsPerPage?: number
}

export default function TableWithPagination({ data, columns, itemsPerPage = 10 }: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentItems.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td key={col.key} className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {col.key === "status" ? ( 
                          // Special styling for status
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              row.status === "Success"
                                ? "bg-green-100 text-green-800"
                                : row.status === "Failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {row.status}
                          </span>
                        ) : col.key === "amount" ? (
                          // Special styling for amount based on trans_type
                          <span
                            className={`font-medium ${
                              row.trans_type === "PUSH" ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {row[col.key]}
                          </span>
                        ) : col.render ? (
                          col.render(row)
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">{Math.min(indexOfLastItem, data.length)}</span> of{" "}
            <span className="font-medium">{data.length}</span> results
          </p>
        </div>
        <div className="flex-1 flex justify-between sm:justify-end">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={indexOfLastItem >= data.length}
            className="ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
