"use client"

import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog"

interface ApprovalFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (token: string) => void;
  isLoading: boolean;
}

export default function ApprovalFlow({
  open,
  onOpenChange,
  onSubmit,
  isLoading
}: ApprovalFlowProps) {
  return (
    <TwoFactorAuthDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
}
