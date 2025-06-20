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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { post, get } from "@/utils/api";
import { toast } from "react-hot-toast";
import { Trash2, Eye, Plus, Loader2 } from "lucide-react";
import { lrGet, lrPost } from "@/utils/liquidityRailApi";
import AddPaymentMethod from "./AddPaymentMethod";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [methodType, setMethodType] = useState<"mobile_money" | "bank">("mobile_money");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

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
      setLoading(true);
      console.log('Fetching payment methods...');
      
      // Updated to match the JS file API endpoint
      const response = await lrGet("/accounts/getPaymentMethods");
      console.log('Payment methods response:', response);
      
      if (response && Array.isArray(response)) {
        console.log('Payment methods data:', response);
        setPaymentMethods(response);
      } else {
        console.error('Invalid response format. Expected array:', response);
        toast.error("Invalid response format from server");
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to fetch payment methods: " + (error instanceof Error ? error.message : "Unknown error"));
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };



  const handleDeletePaymentMethod = async () => {
    if (!selectedMethod) return;
    
    try {
      setIsDeleting(true);
      
      // Updated to match the JS file API endpoint
      const response = await lrGet(`accounts/deletePhoneNumber/${selectedMethod.payment_method_id}`);
      
      if (response && (response.status === 200 || response.status === 201)) {
        toast.success(response.message || "Payment method deleted successfully");
        setShowDeleteDialog(false);
        setSelectedMethod(null);
        fetchPaymentMethods();
      } else {
        toast.error(response?.message || "Failed to delete payment method");
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Failed to delete payment method: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "mobile_money",
      currency: "",
      country_code: "",
      account_name: "",
      phone_number: "",
      network: "",
    });
    setMethodType("mobile_money");
  };

  const openDeleteDialog = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowDeleteDialog(true);
  };

  const openDetailsDialog = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowDetailsDialog(true);
  };

  const getTypeLabel = (type: string) => {
    if (!type) return '';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

 
  return (
    <div className="p-6 max-w-[1200px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment Methods
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods for receiving funds
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {/* Payment Methods List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading payment methods...
          </div>
        ) : paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                You don't have any payment methods yet. Click "Add Payment Method" to create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.payment_method_id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base">
                    {getTypeLabel(method.type)}
                  </CardTitle>
                  <Badge variant={method.type === "bank" ? "default" : "secondary"}>
                    {method.currency}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailsDialog(method)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(method)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-2">
                  {method.type === "mobile_money"
                    ? `${method.network} - ${method.phone_number}`
                    : `${method.bank_name}`}
                </CardDescription>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Account Name</p>
                    <p className="text-muted-foreground">{method.account_name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Country</p>
                    <p className="text-muted-foreground">{method.country_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

   <AddPaymentMethod showAddDialog={showAddDialog} setShowAddDialog={setShowAddDialog} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedMethod && (
            <div className="my-4 p-4 bg-destructive/10 rounded-lg">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {getTypeLabel(selectedMethod.type)}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {selectedMethod.account_name}
                </div>
                <div>
                  <span className="font-medium">
                    {selectedMethod.type === 'bank' ? 'Account Number:' : 'Phone Number:'}
                  </span>{' '}
                  {selectedMethod.type === 'bank' ? selectedMethod.account_number : selectedMethod.phone_number}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMethod(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePaymentMethod}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Method Details</DialogTitle>
          </DialogHeader>
          {selectedMethod && (
            <div className="py-4">
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg">
                  {getTypeLabel(selectedMethod.type)}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Currency</p>
                  <p className="font-medium">{selectedMethod.currency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                  <p className="font-medium">{selectedMethod.account_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedMethod.type === 'bank' ? 'Account Number' : 'Phone Number'}
                  </p>
                  <p className="font-medium font-mono">
                    {selectedMethod.type === 'bank' ? selectedMethod.account_number : selectedMethod.phone_number}
                  </p>
                </div>
                {selectedMethod.type !== 'bank' && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Network</p>
                    <p className="font-medium">{selectedMethod.network}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Country Code</p>
                  <p className="font-medium">{selectedMethod.country_code}</p>
                </div>
                
                {selectedMethod.type === 'bank' && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{selectedMethod.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Code</p>
                      <p className="font-medium">{selectedMethod.bank_code}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Bank Address</p>
                      <p className="font-medium">{selectedMethod.bank_address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Country</p>
                      <p className="font-medium">{selectedMethod.bank_country}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Phone Number</p>
                      <p className="font-medium">{selectedMethod.bank_phone_number}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={() => {
                  setShowDetailsDialog(false);
                  setSelectedMethod(null);
                }}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 