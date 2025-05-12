interface SummaryCardsProps {
    totalTransactions: number
    totalClients: number
    totalTransactionFees: number
  }
  
  const SummaryCards: React.FC<SummaryCardsProps> = ({ totalTransactions, totalClients, totalTransactionFees }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Transactions</h3>
          <p className="text-2xl font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Clients</h3>
          <p className="text-2xl font-bold text-gray-900">{totalClients.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Transaction Fees</h3>
          <p className="text-2xl font-bold text-gray-900">{totalTransactionFees.toLocaleString()} UGX</p>
        </div>
      </div>
    )
  }
  
  export default SummaryCards