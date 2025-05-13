
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReconciliationData {
  id: number;
  accountName: string;
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  adjustedBalance: number;
  currency: string;
}

interface ReconciliationTabProps {
  reconciliationData: ReconciliationData[];
}

const ReconciliationTab: React.FC<ReconciliationTabProps> = ({ reconciliationData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Reconciliation</CardTitle>
        <CardDescription>
          Reconciliation of all accounts with pending transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Current Balance</TableHead>
              <TableHead>Pending Deposits</TableHead>
              <TableHead>Pending Withdrawals</TableHead>
              <TableHead>Adjusted Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reconciliationData.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.balance.toLocaleString()} {account.currency}</TableCell>
                <TableCell>{account.pendingDeposits.toLocaleString()} {account.currency}</TableCell>
                <TableCell>{account.pendingWithdrawals.toLocaleString()} {account.currency}</TableCell>
                <TableCell>{account.adjustedBalance.toLocaleString()} {account.currency}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReconciliationTab;
