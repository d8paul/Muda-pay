"use client"

import React from "react"

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import { FilterList } from "@mui/icons-material"
import { Container } from "@mui/system"

const TransactionFilter = () => (
  <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
    <Typography variant="h6" gutterBottom>
      Transaction Filter
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
          <Select labelId="transaction-type-label" id="transaction-type" label="Transaction Type">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="collection">Collection</MenuItem>
            <MenuItem value="payout">Payout</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel id="date-range-label">Date Range</InputLabel>
          <Select labelId="date-range-label" id="date-range" label="Date Range">
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="last7days">Last 7 days</MenuItem>
            <MenuItem value="last30days">Last 30 days</MenuItem>
            <MenuItem value="thisMonth">This Month</MenuItem>
            <MenuItem value="lastMonth">Last Month</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Account Number" variant="outlined" />
      </Grid>
    </Grid>
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
      <Button variant="contained" color="primary">
        Apply Filter
      </Button>
    </Box>
  </Paper>
)

const TransactionsTable = () => {
  // Replace with your actual TransactionsTable component
  return <div>Transactions Table Content</div>
}

const DashboardWithSidebar = ({ selectedMenu }: { selectedMenu: string }) => {
  const [showFilter, setShowFilter] = React.useState(false)

  return (
    // ... rest of your component code ...
    <>
      {/* ... other cases ... */}
      {selectedMenu === "Transactions" && (
        <Container maxWidth="lg">
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" startIcon={<FilterList />} onClick={() => setShowFilter(!showFilter)}>
              {showFilter ? "Hide Filter" : "Show Filter"}
            </Button>
          </Box>
          {showFilter && <TransactionFilter />}
          <TransactionsTable />
        </Container>
      )}
      {/* ... rest of your component code ... */}
    </>
  )
}

export default DashboardWithSidebar

