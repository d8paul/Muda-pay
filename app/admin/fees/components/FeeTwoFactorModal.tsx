import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { QrCode, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface FeeTwoFactorModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
}

const FeeTwoFactorModal = ({ open, onClose, onVerify }: FeeTwoFactorModalProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQRCode, setShowQRCode] = useState(true);

  // This function would normally validate with a backend
  const validateOTP = () => {
    setIsVerifying(true);
    
    // Mock verification - in a real app this would call an API
    setTimeout(() => {
      if (otp === "123456") { // Mock correct code
        toast.success("2FA verification successful");
        onVerify();
        resetForm();
      } else {
        toast.error("Invalid verification code");
      }
      setIsVerifying(false);
    }, 1000);
  };

  const resetForm = () => {
    setOtp("");
    setShowQRCode(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {showQRCode 
              ? "Scan this QR code with Google Authenticator to set up 2FA."
              : "Enter the 6-digit verification code from your authenticator app."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {showQRCode ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="border border-gray-200 rounded-md p-4 bg-white">
                <div className="relative w-64 h-64">
                  {/* QR Code Image - In a real app, this would be dynamically generated */}
                  <div className="bg-white p-4 flex items-center justify-center h-full">
                    <QrCode size={180} className="text-black" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="h-16 w-16 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setShowQRCode(false)}
                className="bg-[#26a0ff] hover:bg-blue-700"
              >
                I've scanned the code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                Enter the code from your authenticator app
              </p>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground mt-2">
                For demo purposes, the code is "123456"
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={resetForm} disabled={isVerifying}>
            Cancel
          </Button>
          {!showQRCode && (
            <Button 
              onClick={validateOTP} 
              disabled={otp.length !== 6 || isVerifying}
              className="bg-[#26a0ff] hover:bg-blue-700"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeTwoFactorModal;