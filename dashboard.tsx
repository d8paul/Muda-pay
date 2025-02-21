"use client"
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material"
import { AttachMoney, AccountBalance, TrendingUp, ShoppingCart } from "@mui/icons-material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Importing Montserrat font
import { Montserrat } from "next/font/google"

const montserrat = Montserrat({ subsets: ["latin"] })

// Create a theme with Montserrat as the main font
const theme = createTheme({
  typography: {
    fontFamily: montserrat.style.fontFamily,
  },
  palette: {
    primary: {
      main: "#4fc3f7", // Light sky blue
    },
    secondary: {
      main: "#03a9f4", // Slightly darker sky blue
    },
    background: {
      default: "#e1f5fe", // Very light sky blue
    },
  },
})

// Sample data for the chart
const chartData = [
  { name: "Mon", amount: 4000 },
  { name: "Tue", amount: 3000 },
  { name: "Wed", amount: 5000 },
  { name: "Thu", amount: 2780 },
  { name: "Fri", amount: 1890 },
  { name: "Sat", amount: 2390 },
  { name: "Sun", amount: 3490 },
]

// Sample transaction data
const transactions = [
  { id: 1, description: "Payment received", amount: 500 },
  { id: 2, description: "Withdrawal", amount: -200 },
  { id: 3, description: "Subscription payment", amount: 50 },
  { id: 4, description: "Refund processed", amount: -75 },
]

const StatusCard = ({ title, value, icon }) => (
  <Paper elevation={3} sx={{ p: 2, display: "flex", alignItems: "center" }}>
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h6" component="div">
        {title}
      </Typography>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </Box>
  </Paper>
)

export default function Dashboard() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatusCard title="Collections" value="$12,543" icon={<AttachMoney color="primary" fontSize="large" />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatusCard title="Payouts" value="$8,251" icon={<AccountBalance color="primary" fontSize="large" />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatusCard
                title="Transactions Today"
                value="152"
                icon={<ShoppingCart color="primary" fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatusCard
                title="Volume This Week"
                value="$45,678"
                icon={<TrendingUp color="primary" fontSize="large" />}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Volume
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#4fc3f7" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <List>
                  {transactions.map((transaction) => (
                    <ListItem key={transaction.id} divider>
                      <ListItemText primary={transaction.description} secondary={`$${Math.abs(transaction.amount)}`} />
                      <Typography variant="body2" color={transaction.amount >= 0 ? "success.main" : "error.main"}>
                        {transaction.amount >= 0 ? "+" : "-"}${Math.abs(transaction.amount)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

