"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { post, get } from "@/utils/api";
import { toast } from "react-hot-toast";

interface PaymentMethod {
  id: number;
  payment_method_id: string;
  company_id: string;
  kotani_customer_key: string;
  type: "mobile_money" | "bank";
  currency: string;
  phone_number?: string;
  country_code: string;
  network?: string;
  account_name: string;
  bank_name?: string | null;
  bank_code?: string | null;
  account_number?: string | null;
  bank_address?: string | null;
  bank_phone_number?: string | null;
  bank_country?: string | null;
  sort_code?: string | null;
  swift_code?: string | null;
  created_at: string;
  updated_at: string;
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [methodType, setMethodType] = useState<"mobile_money" | "bank">("mobile_money");

  // Form states
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: "mobile_money",
    currency: "",
    country_code: "",
    account_name: "",
    phone_number: "",
    network: "",
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await get("web/rail/accounts/getPaymentMethods");
         setPaymentMethods(response);
      
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const response = await post("rail/accounts/addPaymentMethod", formData);
      if (response.status === 200) {
        toast.success("Payment method added successfully");
        setIsAddingMethod(false);
        fetchPaymentMethods();
        setFormData({
          type: "mobile_money",
          currency: "",
          country_code: "",
          account_name: "",
          phone_number: "",
          network: "",
        });
      } else {
        toast.error(response.message || "Failed to add payment method");
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method");
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

  return (
    <div className="p-6 max-w-[1200px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment Methods
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods for withdrawals
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Payment Method</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a new payment method for withdrawals
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select
                value={methodType}
                onValueChange={(value: "mobile_money" | "bank") => {
                  setMethodType(value);
                  setFormData({
                    type: value,
                    currency: "",
                    country_code: "",
                    account_name: "",
                    ...(value === "mobile_money"
                      ? { phone_number: "", network: "" }
                      : {}),
                  });
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

              <div className="mt-4">{renderForm()}</div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleAddPaymentMethod}>Add Method</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div>Loading payment methods...</div>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.payment_method_id}>
              <CardHeader>
                <CardTitle>
                  {method.type === "mobile_money"
                    ? "Mobile Money"
                    : "Bank Account"}
                </CardTitle>
                <CardDescription>
                  {method.type === "mobile_money"
                    ? `${method.network} - ${method.phone_number}`
                    : `${method.bank_name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">
                      {method.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <p className="text-sm text-muted-foreground">
                      {method.country_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Name</p>
                    <p className="text-sm text-muted-foreground">
                      {method.account_name}
                    </p>
                  </div>
                  {method.type === "bank" && (
                    <>
                      <div>
                        <p className="text-sm font-medium">Bank Name</p>
                        <p className="text-sm text-muted-foreground">
                          {method.bank_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Account Number</p>
                        <p className="text-sm text-muted-foreground">
                          {method.account_number}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 