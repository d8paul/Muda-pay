"use client"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { FaCheck, FaTimes } from "react-icons/fa"
import { Deposit } from "../types"

interface DepositRowProps {
  deposit: Deposit;
  onAction: (trans_id: string, type: 'approve' | 'reject') => void;
  isLoading: boolean;
}

export default function DepositRow({ deposit, onAction, isLoading }: DepositRowProps) {
  return (
    <TableRow key={deposit.trans_id}>
      <TableCell>{deposit.client_id}</TableCell>
      <TableCell>{format(new Date(deposit.created_at), "PPpp")}</TableCell>
      <TableCell>{parseFloat(deposit.amount).toLocaleString()}</TableCell>
      <TableCell>{deposit.memo}</TableCell>
      <TableCell>{deposit.trans_id}</TableCell>
      <TableCell className="flex gap-2">
        <Button
          onClick={() => onAction(deposit.trans_id, "approve")}
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          <FaCheck /> Approve
        </Button>
        <Button
          onClick={() => onAction(deposit.trans_id, "reject")}
          className="flex items-center gap-1"
          variant="destructive"
          disabled={isLoading}
        >
          <FaTimes /> Reject
        </Button>
      </TableCell>
    </TableRow>
  );
}
