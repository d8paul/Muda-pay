"use client"

import ProgressBar from "@/components/ProgressBar"
import PendingDepositsTable from "./components/PendingDepositsTable"
import RejectDepositDialog from "./components/RejectDepositDialog"
import ApprovalFlow from "./components/ApprovalFlow"
import { usePendingDeposits } from "./hooks/usePendingDeposits"
import { useDepositActions } from "./hooks/useDepositActions"

export default function PendingDepositsPage() {
  const { isLoading, pendingDeposits, removeDeposit } = usePendingDeposits();
  const {
    isLoading: actionLoading,
    selectedTransId,
    show2FAModal,
    showRejectModal,
    openAction,
    handleApprove,
    handleReject,
    closeModals,
    setShow2FAModal,
    setShowRejectModal
  } = useDepositActions();

  const onDepositAction = (trans_id: string, type: 'approve' | 'reject') => {
    openAction(trans_id, type);
  };

  const onApprovalSubmit = (token: string) => {
    handleApprove(token, removeDeposit);
  };

  const onRejectConfirm = () => {
    handleReject(removeDeposit);
  };

  return (
    <>
      <ProgressBar isLoading={isLoading || actionLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Pending Deposits</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <PendingDepositsTable
              deposits={pendingDeposits}
              onAction={onDepositAction}
              isLoading={isLoading || actionLoading}
            />
          </div>
        </div>
      </div>
      
      <RejectDepositDialog
        open={showRejectModal}
        onOpenChange={(open) => {
          setShowRejectModal(open);
          if (!open) closeModals();
        }}
        onConfirm={onRejectConfirm}
        transactionId={selectedTransId}
        isLoading={actionLoading}
      />

      <ApprovalFlow
        open={show2FAModal}
        onOpenChange={(open) => {
          setShow2FAModal(open);
          if (!open) closeModals();
        }}
        onSubmit={onApprovalSubmit}
        isLoading={actionLoading}
      />
    </>
  );
}