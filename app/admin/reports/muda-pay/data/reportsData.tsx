
// Mock data for reports
export const tradeData = [
    { id: 1, date: "2025-04-25", volume: 2500000, cost: 150000, spread: 1.2, profit: 300000, currency: "UGX" },
    { id: 2, date: "2025-04-26", volume: 3200000, cost: 190000, spread: 1.1, profit: 352000, currency: "UGX" },
    { id: 3, date: "2025-04-27", volume: 1800000, cost: 120000, spread: 1.3, profit: 234000, currency: "UGX" },
    { id: 4, date: "2025-04-28", volume: 4500000, cost: 230000, spread: 1.0, profit: 450000, currency: "UGX" },
  ];
  
  export const volumeData = [
    { month: "Jan", volume: 1450000 },
    { month: "Feb", volume: 1820000 },
    { month: "Mar", volume: 1930000 },
    { month: "Apr", volume: 2100000 },
  ];
  
  export const userData = [
    { month: "Jan", users: 125 },
    { month: "Feb", users: 156 },
    { month: "Mar", users: 189 },
    { month: "Apr", users: 214 },
  ];
  
  export const reconciliationData = [
    { id: 1, accountName: "Main Operational Account", balance: 450000000, pendingDeposits: 32000000, pendingWithdrawals: 18000000, adjustedBalance: 464000000, currency: "UGX" },
    { id: 2, accountName: "Settlement Account", balance: 235000000, pendingDeposits: 15000000, pendingWithdrawals: 22000000, adjustedBalance: 228000000, currency: "UGX" },
    { id: 3, accountName: "Reserve Account", balance: 780000000, pendingDeposits: 0, pendingWithdrawals: 0, adjustedBalance: 780000000, currency: "UGX" },
    { id: 4, accountName: "Transaction Fee Account", balance: 132000000, pendingDeposits: 5000000, pendingWithdrawals: 0, adjustedBalance: 137000000, currency: "UGX" },
  ];
  