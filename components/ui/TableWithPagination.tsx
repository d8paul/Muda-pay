import { useState } from "react";
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Column {
  key: string;
  label: string;
  render?: (row: any) => JSX.Element | string;
}

interface Props {
  data: any[];
  columns: Column[];
  itemsPerPage?: number;
}

export default function TableWithPagination({ data, columns, itemsPerPage = 10 }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const openModal = (row: any) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

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
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentItems.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td key={col.key} className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {col.key === "status" ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              row.status === "SUCCESS"
                                ? "bg-green-100 text-green-800"
                                : row.status === "Failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {row.status.toUpperCase()}
                          </span>
                        ) : col.key === "amount" ? (
                          <span
                            className={`font-medium ${
                              row.trans_type === "PULL" || row.trans_type === "BANK_DEPOSIT"
                                ? "text-green-600"
                                : "text-red-600"
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
                    {/* View Button */}
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => openModal(row)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="h-5 w-5 mr-1" />
                      </button>
                    </td>
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

     
      {isModalOpen && selectedRow && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full sm:w-1/2 max-h-[80vh] overflow-y-auto p-6 relative">
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <h2 className="text-lg font-semibold mb-4">Row Details</h2>
      <div className="space-y-2">
        {Object.entries(selectedRow).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b pb-2">
            <span className="font-medium capitalize">{key}:</span>
            <span className="break-words max-w-[60%]">{String(value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
