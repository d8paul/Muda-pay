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
        console.log("Fetching pending deposits...");
        const response = await get("/admin/pending-deposits");
        console.log("Pending deposits response:", response);
        
        // Handle different response structures
        if (response) {
          if (Array.isArray(response)) {
            setPendingDeposits(response);
          } else if (response.data && Array.isArray(response.data)) {
            setPendingDeposits(response.data);
          } else if (response.data) {
            // If response.data is not an array, wrap it in an array or set empty
            setPendingDeposits(Array.isArray(response.data) ? response.data : []);
          } else {
            setPendingDeposits([]);
          }
        } else {
          setPendingDeposits([]);
        }
        
        console.log("Deposits set successfully");
      } catch (error) {
        console.error("Error fetching pending deposits:", error);
        setPendingDeposits([]); // Set empty array on error
        // Error toast is automatically shown by the API interceptor
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
      // API utility unwraps the response, check for success differently
      toast.success(
        actionType === "approve"
          ? "Deposit approved successfully"
          : "Deposit rejected successfully"
      );
      setPendingDeposits((prev) =>
        prev.filter((deposit) => deposit.trans_id !== selectedTransId)
      );
    } catch (error) {
      console.error(
        `Error ${actionType === "approve" ? "approving" : "rejecting"} deposit:`,
        error
      );
      // Error toast is automatically shown by the API interceptor
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2">Loading pending deposits...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : pendingDeposits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <p>No pending deposits found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingDeposits.map((deposit) => (
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
                            disabled={isLoading}
                          >
                            <FaCheck /> Approve
                          </Button>
                          <Button
                            onClick={() => openModal(deposit.trans_id, "reject")}
                            className="flex items-center gap-1"
                            variant="destructive"
                            disabled={isLoading}
                          >
                            <FaTimes /> Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}