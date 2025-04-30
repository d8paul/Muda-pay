"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"
import ProgressBar from "@/components/ProgressBar"
import { get, post } from "@/utils/api"
import { format } from "date-fns"
import FeeTwoFactorModal from "@/app/admin/fees/components/FeeTwoFactorModal"

export default function PendingDepositsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransId, setSelectedTransId] = useState(null);

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

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await post("payment/approveDepositTransaction", { trans_id: selectedTransId });
      if (response.status === 200) {
        toast.success("Deposit approved successfully");
        setPendingDeposits((prev) => prev.filter((deposit) => deposit.trans_id !== selectedTransId));
      } else {
        toast.error("Failed to approve deposit");
      }
    } catch (error) {
      console.error("Error approving deposit:", error);
      toast.error("An error occurred while approving deposit");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const openModal = (trans_id) => {
    setSelectedTransId(trans_id);
    setIsModalOpen(true);
  };

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <FeeTwoFactorModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={handleApprove}
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
                      <TableCell>
                        <Button onClick={() => openModal(deposit.trans_id)}>Approve</Button>
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
