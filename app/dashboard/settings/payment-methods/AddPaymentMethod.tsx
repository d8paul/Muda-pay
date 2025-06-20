import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { post } from "@/utils/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { lrPost } from "@/utils/liquidityRailApi";

interface AddPaymentMethodProps {
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
}


export default function AddPaymentMethod({ showAddDialog, setShowAddDialog }: AddPaymentMethodProps) {
  const [methodType, setMethodType] = useState<"mobile_money" | "bank">("mobile_money");
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [formData, setFormData] = useState({
    type: "mobile_money",
    currency: "",
    country_code: "",
    account_name: "",
    phone_number: "",
    network: "",
    bank_name: "",
    account_number: "",
    bank_code: "",
    sort_code: "",
    bank_address: "",
    bank_country: "",
    bank_phone_number: "",
    swift_code: ""
  });

  const { register, handleSubmit, reset } = useForm();  

  const handleAddPaymentMethod = async () => {
    try {
      setIsAddingMethod(true);
      const response = await lrPost("/accounts/addPaymentMethod", formData);
      if (response.status === 200) {
        toast.success('Payment method added successfully');
        reset();
        setShowAddDialog(false);
      } else {
        toast.error('Failed to add payment method');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    } finally {
      setIsAddingMethod(false);
    }
  };

  const renderForm = () => {
    if (methodType === "mobile_money") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Currency</label>
              <Input
                value={formData.currency || ""}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                placeholder="e.g. UGX"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country Code</label>
              <Input
                value={formData.country_code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, country_code: e.target.value })
                }
                placeholder="e.g. UG"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={formData.phone_number || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              placeholder="+256700000000"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Network</label>
            <Select
              value={formData.network || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, network: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTN">MTN</SelectItem>
                <SelectItem value="AIRTEL">Airtel</SelectItem>
                <SelectItem value="MPESA">MPESA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Account Name</label>
            <Input
              value={formData.account_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, account_name: e.target.value })
              }
              placeholder="Full Name"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Currency</label>
            <Input
              value={formData.currency || ""}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              placeholder="e.g. GHS"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Country Code</label>
            <Input
              value={formData.country_code || ""}
              onChange={(e) =>
                setFormData({ ...formData, country_code: e.target.value })
              }
              placeholder="e.g. GH"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Bank Name</label>
          <Input
            value={formData.bank_name || ""}
            onChange={(e) =>
              setFormData({ ...formData, bank_name: e.target.value })
            }
            placeholder="Bank Name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Account Number</label>
          <Input
            value={formData.account_number || ""}
            onChange={(e) =>
              setFormData({ ...formData, account_number: e.target.value })
            }
            placeholder="Account Number"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Account Name</label>
          <Input
            value={formData.account_name || ""}
            onChange={(e) =>
              setFormData({ ...formData, account_name: e.target.value })
            }
            placeholder="Account Name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Bank Code</label>
            <Input
              value={formData.bank_code || ""}
              onChange={(e) =>
                setFormData({ ...formData, bank_code: e.target.value })
              }
              placeholder="Bank Code"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Sort Code</label>
            <Input
              value={formData.sort_code || ""}
              onChange={(e) =>
                setFormData({ ...formData, sort_code: e.target.value })
              }
              placeholder="Sort Code"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Bank Address</label>
          <Input
            value={formData.bank_address || ""}
            onChange={(e) =>
              setFormData({ ...formData, bank_address: e.target.value })
            }
            placeholder="Bank Address"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Bank Country</label>
            <Input
              value={formData.bank_country || ""}
              onChange={(e) =>
                setFormData({ ...formData, bank_country: e.target.value })
              }
              placeholder="Bank Country"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Bank Phone Number</label>
            <Input
              value={formData.bank_phone_number || ""}
              onChange={(e) =>
                setFormData({ ...formData, bank_phone_number: e.target.value })
              }
              placeholder="Bank Phone Number"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Swift Code</label>
          <Input
            value={formData.swift_code || ""}
            onChange={(e) =>
              setFormData({ ...formData, swift_code: e.target.value })
            }
            placeholder="Swift Code"
          />
        </div>
      </div>
    );
  };

  const resetForm = () => {
    reset();
    setFormData({
      type: "mobile_money",
      currency: "",
      country_code: "",
      account_name: "",
      phone_number: "",
      network: "",
      bank_name: "",
      account_number: "",
      bank_code: "",
      sort_code: "",
      bank_address: "",
      bank_country: "",
      bank_phone_number: "",
      swift_code: ""
    });
  };

  const renderMainForm = () => {
    return (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method for receiving funds
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="mb-4">
              <label className="text-sm font-medium">Payment Method Type</label>
              <Select
            value={methodType}
            onValueChange={(value: "mobile_money" | "bank") => {
              setMethodType(value);
              resetForm();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="bank">Bank Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {renderForm()}
        

        <div className="mt-6 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowAddDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddPaymentMethod}
            disabled={isAddingMethod}
          >
            {isAddingMethod ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Method"
            )}
          </Button>
        </div>
      </div>
      </DialogContent>
      </Dialog>
    );
  };

  return renderMainForm();
}