"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DepositRow from "./DepositRow"
import { Deposit } from "../types"

interface PendingDepositsTableProps {
  deposits: Deposit[];
  onAction: (trans_id: string, type: 'approve' | 'reject') => void;
  isLoading: boolean;
}

export default function PendingDepositsTable({ 
  deposits, 
  onAction, 
  isLoading 
}: PendingDepositsTableProps) {
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading pending deposits...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (deposits.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <div className="text-gray-500">
              <p>No pending deposits found</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return deposits.map((deposit) => (
      <DepositRow
        key={deposit.trans_id}
        deposit={deposit}
        onAction={onAction}
        isLoading={isLoading}
      />
    ));
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Wallet ID</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>Amount (UGX)</TableHead>
            <TableHead>Narration</TableHead>
            <TableHead>Deposit Reference</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderTableContent()}
        </TableBody>
      </Table>
    </div>
  );
}
