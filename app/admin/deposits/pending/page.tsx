"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { get, post } from "@/utils/api"
import { format } from "date-fns"
import FeeTwoFactorModal from "@/app/admin/fees/components/FeeTwoFactorModal"
import { FaCheck, FaTimes } from "react-icons/fa" // Import icons

interface Deposit {
  trans_id: string;
  client_id: string;
  created_at: string;
  amount: string;
  memo: string;
}

export default function PendingDepositsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState<Deposit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransId, setSelectedTransId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    const fetchPendingDeposits = async () => {
      setIsLoading(true);
      try {
        const response = await get("/admin/pending-deposits");
        if (response.status === 200) {
          setPendingDeposits(response.data);
        }
      } catch (error) {
        console.error("Error fetching pending deposits:", error);
        toast.error("Failed to fetch pending deposits");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingDeposits();
  }, []);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        actionType === "approve"
          ? "payment/approveDepositTransaction"
          : "payment/rejectDepositTransaction";

      const response = await post(endpoint, { trans_id: selectedTransId });
      if (response.status === 200) {
        toast.success(
          actionType === "approve"
            ? "Deposit approved successfully"
            : "Deposit rejected successfully"
        );
        setPendingDeposits((prev) =>
          prev.filter((deposit) => deposit.trans_id !== selectedTransId)
        );
      } else {
        toast.error(
          actionType === "approve"
            ? "Failed to approve deposit"
            : "Failed to reject deposit"
        );
      }
    } catch (error) {
      console.error(
        `Error ${actionType === "approve" ? "approving" : "rejecting"} deposit:`,
        error
      );
      toast.error(
        `An error occurred while ${
          actionType === "approve" ? "approving" : "rejecting"
        } deposit`
      );
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const openModal = (trans_id: string, type: 'approve' | 'reject') => {
    setSelectedTransId(trans_id);
    setActionType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <FeeTwoFactorModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={handleAction}
      />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Pending Deposits</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
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
                  {pendingDeposits.map((deposit) => (
                    <TableRow key={deposit.trans_id}>
                      <TableCell>{deposit.client_id}</TableCell>
                      <TableCell>{format(new Date(deposit.created_at), "PPpp")}</TableCell>
                      <TableCell>{parseFloat(deposit.amount).toLocaleString()}</TableCell>
                      <TableCell>{deposit.memo}</TableCell>
                      <TableCell>{deposit.trans_id}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          onClick={() => openModal(deposit.trans_id, "approve")}
                          className="flex items-center gap-1"
                        >
                          <FaCheck /> Approve
                        </Button>
                        <Button
                          onClick={() => openModal(deposit.trans_id, "reject")}
                          className="flex items-center gap-1"
                          variant="destructive"
                        >
                          <FaTimes /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}