"use client"

import { useState } from "react"
import { TextField, Select, MenuItem, Button, Box } from "@mui/material"

export default function TransactionFilter() {
  const [transactionType, setTransactionType] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  const handleFilter = () => {
    console.log("Filtering with:", { transactionType, startDate, endDate, accountNumber })
  }

  return (
    <Box className="bg-white shadow sm:rounded-lg mb-6 p-4">
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value as string)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="push">Push</MenuItem>
          <MenuItem value="pull">Pull</MenuItem>
        </Select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <TextField
          label="Account Number"
          variant="outlined"
          size="small"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />

        <Button variant="contained" color="primary" onClick={handleFilter}>
          Apply Filter
        </Button>
      </Box>
    </Box>
  )
}

