export interface Bank {
  id: number
  bank_name: string
  account_name: string
  account_number: string
  swift_code: string
  country: string
  currency: string
  reference_code: string
  created_at?: string
  updated_at?: string
}

export interface BankFormData {
  bank_name: string
  account_name: string
  account_number: string
  swift_code: string
  country: string
  currency: string
  reference_code: string
}

export const initialFormData: BankFormData = {
  bank_name: "",
  account_name: "",
  account_number: "",
  swift_code: "",
  country: "",
  currency: "",
  reference_code: ""
}

// Common currencies and countries
export const currencies = ["UGX", "KES", "TZS", "RWF", "USD", "EUR", "GBP"]

export const countries = [
  { code: "UG", name: "Uganda" },
  { code: "KE", name: "Kenya" },
  { code: "TZ", name: "Tanzania" },
  { code: "RW", name: "Rwanda" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" }
]
