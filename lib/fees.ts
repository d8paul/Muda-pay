// Mock transaction fee data
export interface TransactionFee {
  id: string;
  feeName: string;
  feeType: "percentage" | "fixed";
  feeValue: number;
  minAmount: number;
  maxAmount: number | null;
  applicableTo: "deposit" | "withdrawal" | "transfer" | "all";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// Initial mock data
export const initialFees: TransactionFee[] = [
  {
    id: "fee-001",
    feeName: "Standard Withdrawal Fee",
    feeType: "percentage",
    feeValue: 1.5,
    minAmount: 1000,
    maxAmount: 100000,
    applicableTo: "withdrawal",
    status: "active",
    createdAt: "2025-03-15T10:30:00Z",
    updatedAt: "2025-03-15T10:30:00Z",
  },
  {
    id: "fee-002",
    feeName: "Premium Transfer Fee",
    feeType: "fixed",
    feeValue: 5000,
    minAmount: 50000,
    maxAmount: null,
    applicableTo: "transfer",
    status: "active",
    createdAt: "2025-03-10T14:20:00Z",
    updatedAt: "2025-03-10T14:20:00Z",
  },
  {
    id: "fee-003",
    feeName: "Deposit Processing Fee",
    feeType: "percentage",
    feeValue: 0.8,
    minAmount: 5000,
    maxAmount: 500000,
    applicableTo: "deposit",
    status: "active",
    createdAt: "2025-02-28T09:15:00Z",
    updatedAt: "2025-03-01T11:45:00Z",
  },
  {
    id: "fee-004",
    feeName: "Inter-account Transfer",
    feeType: "fixed",
    feeValue: 2000,
    minAmount: 0,
    maxAmount: null,
    applicableTo: "transfer",
    status: "inactive",
    createdAt: "2025-02-20T16:10:00Z",
    updatedAt: "2025-03-05T13:30:00Z",
  },
  {
    id: "fee-005",
    feeName: "Global Transaction Fee",
    feeType: "percentage",
    feeValue: 2.5,
    minAmount: 10000,
    maxAmount: 1000000,
    applicableTo: "all",
    status: "active",
    createdAt: "2025-01-15T08:45:00Z",
    updatedAt: "2025-01-15T08:45:00Z",
  },
];

// Simulate storing fees in localStorage
export const initializeFeesStorage = () => {
  if (!localStorage.getItem("transactionFees")) {
    localStorage.setItem("transactionFees", JSON.stringify(initialFees));
  }
};

// Simulate API delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface FeeProduct {
  product_id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// Simulate API calls
export const feesApi = {
  // Get all fees with optional filtering
  getAll: async (filters?: {
    feeName?: string;
    feeType?: string;
    applicableTo?: string;
    status?: string;
  }): Promise<TransactionFee[]> => {
    initializeFeesStorage();
    await simulateDelay(800);
    
    let fees = JSON.parse(localStorage.getItem("transactionFees") || "[]") as TransactionFee[];
    
    if (filters) {
      if (filters.feeName) {
        fees = fees.filter(fee => 
          fee.feeName.toLowerCase().includes(filters.feeName?.toLowerCase() || "")
        );
      }
      if (filters.feeType && filters.feeType !== "all") {
        fees = fees.filter(fee => fee.feeType === filters.feeType);
      }
      if (filters.applicableTo && filters.applicableTo !== "all") {
        fees = fees.filter(fee => fee.applicableTo === filters.applicableTo);
      }
      if (filters.status && filters.status !== "all") {
        fees = fees.filter(fee => fee.status === filters.status);
      }
    }
    
    return fees;
  },
  
  // Get fee by ID
  getById: async (id: string): Promise<TransactionFee | null> => {
    initializeFeesStorage();
    await simulateDelay(500);
    
    const fees = JSON.parse(localStorage.getItem("transactionFees") || "[]") as TransactionFee[];
    const fee = fees.find(f => f.id === id);
    return fee || null;
  },
  
  // Create new fee
  create: async (feeData: Omit<TransactionFee, "id" | "createdAt" | "updatedAt">): Promise<TransactionFee> => {
    initializeFeesStorage();
    await simulateDelay(1000);
    
    const fees = JSON.parse(localStorage.getItem("transactionFees") || "[]") as TransactionFee[];
    
    const newFee: TransactionFee = {
      ...feeData,
      id: `fee-${String(fees.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fees.push(newFee);
    localStorage.setItem("transactionFees", JSON.stringify(fees));
    
    return newFee;
  },
  
  // Update existing fee
  update: async (id: string, feeData: Partial<TransactionFee>): Promise<TransactionFee | null> => {
    initializeFeesStorage();
    await simulateDelay(1000);
    
    const fees = JSON.parse(localStorage.getItem("transactionFees") || "[]") as TransactionFee[];
    const index = fees.findIndex(f => f.id === id);
    
    if (index === -1) return null;
    
    fees[index] = {
      ...fees[index],
      ...feeData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem("transactionFees", JSON.stringify(fees));
    return fees[index];
  },
  
  // Delete fee
  delete: async (id: string): Promise<boolean> => {
    initializeFeesStorage();
    await simulateDelay(800);
    
    const fees = JSON.parse(localStorage.getItem("transactionFees") || "[]") as TransactionFee[];
    const filteredFees = fees.filter(f => f.id !== id);
    
    if (filteredFees.length === fees.length) return false;
    
    localStorage.setItem("transactionFees", JSON.stringify(filteredFees));
    return true;
  },

  // Get all fee products
  getAllProducts: async (): Promise<FeeProduct[]> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PAYMENT_API}/admin/fees/products`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fee products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fee products:', error);
      throw error;
    }
  },

  // Get fee product by ID
  getProductById: async (productId: string): Promise<FeeProduct> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PAYMENT_API}/admin/fees/products/${productId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fee product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fee product:', error);
      throw error;
    }
  },

  // Update fee product
  updateProduct: async (productData: {
    product_id: string;
    name: string;
    description: string;
  }): Promise<FeeProduct> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PAYMENT_API}/admin/fees/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to update fee product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating fee product:', error);
      throw error;
    }
  },
};