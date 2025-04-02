import { useState } from "react";

export const IncomeReportTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const data = [
    { date: "2025-04-01", amount: "$1,000", source: "Sales", category: "Retail" },
    { date: "2025-04-02", amount: "$2,500", source: "Consulting", category: "Services" },
    // Add more rows as needed
  ];

  const filteredData = data.filter(
    (row) =>
      row.date.includes(searchTerm) ||
      row.amount.includes(searchTerm) ||
      row.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Income Report</h3>
      <p className="mt-2 text-sm text-gray-500">View your income details in the table below.</p>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 mb-4 p-2 border border-gray-300 rounded-md w-full"
      />
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.source}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TransactionReportTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const data = [
    { date: "2025-04-01", amount: "$500", type: "Credit", status: "Completed" },
    { date: "2025-04-02", amount: "$300", type: "Debit", status: "Pending" },
    // Add more rows as needed
  ];

  const filteredData = data.filter(
    (row) =>
      row.date.includes(searchTerm) ||
      row.amount.includes(searchTerm) ||
      row.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Transaction Report</h3>
      <p className="mt-2 text-sm text-gray-500">View your transaction details in the table below.</p>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 mb-4 p-2 border border-gray-300 rounded-md w-full"
      />
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DepositReportTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const data = [
    { date: "2025-04-01", amount: "$200", method: "Bank Transfer", reference: "#12345" },
    { date: "2025-04-02", amount: "$400", method: "Credit Card", reference: "#67890" },
    // Add more rows as needed
  ];

  const filteredData = data.filter(
    (row) =>
      row.date.includes(searchTerm) ||
      row.amount.includes(searchTerm) ||
      row.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Deposit Report</h3>
      <p className="mt-2 text-sm text-gray-500">View your deposit details in the table below.</p>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 mb-4 p-2 border border-gray-300 rounded-md w-full"
      />
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.method}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};