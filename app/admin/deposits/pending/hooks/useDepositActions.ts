"use client"

import { useState } from "react"
import { post } from "@/utils/api"
import toast from "react-hot-toast"
import { Deposit } from "../types"

export function useDepositActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransId, setSelectedTransId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const openAction = (trans_id: string, type: 'approve' | 'reject') => {
    setSelectedTransId(trans_id);
    setActionType(type);
    if (type === 'approve') {
      setShow2FAModal(true);
    } else {
      setShowRejectModal(true);
    }
  };

  const handleApprove = async (token: string, onSuccess: (transId: string) => void) => {
    if (!selectedTransId) return;
    
    setIsLoading(true);
    try {
      await post("payment/approveDepositTransaction", {
        trans_id: selectedTransId,
        token: token
      });
      toast.success("Deposit approved successfully");
      onSuccess(selectedTransId);
    } catch (error) {
      console.error("Error approving deposit:", error);
    } finally {
      setIsLoading(false);
      setShow2FAModal(false);
      resetState();
    }
  };

  const handleReject = async (onSuccess: (transId: string) => void) => {
    if (!selectedTransId) return;
    
    setIsLoading(true);
    try {
      await post("payment/rejectDepositTransaction", {
        trans_id: selectedTransId
      });
      toast.success("Deposit rejected successfully");
      onSuccess(selectedTransId);
    } catch (error) {
      console.error("Error rejecting deposit:", error);
    } finally {
      setIsLoading(false);
      setShowRejectModal(false);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedTransId(null);
    setActionType(null);
  };

  const closeModals = () => {
    setShow2FAModal(false);
    setShowRejectModal(false);
    resetState();
  };

  return {
    isLoading,
    selectedTransId,
    actionType,
    show2FAModal,
    showRejectModal,
    openAction,
    handleApprove,
    handleReject,
    closeModals,
    setShow2FAModal,
    setShowRejectModal
  };
}
