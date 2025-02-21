"use client"

import { Button } from "@mui/material"
import { Add, SwapHoriz } from "@mui/icons-material"

export default function WalletActions() {
  const handleAddFunds = () => {
    // Implement add funds functionality
    console.log("Add funds clicked")
  }

  const handleTransferFunds = () => {
    // Implement transfer funds functionality
    console.log("Transfer funds clicked")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button variant="contained" startIcon={<Add />} onClick={handleAddFunds}>
        Add Funds
      </Button>
      <Button variant="outlined" startIcon={<SwapHoriz />} onClick={handleTransferFunds}>
        Transfer Funds
      </Button>
    </div>
  )
}

