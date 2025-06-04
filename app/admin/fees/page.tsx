"use client"

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ProgressBar from "./components/ui/progress-bar";
import FeeForm from "./components/FeeForm";
import FeesTable from "./components/FeesTable";
import FeeFilters, { FeeFilters as FeeFiltersType } from "./components/FeeFilters";
import { TransactionFee, feesApi } from "@/lib/fees";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTwoFactorCheck } from "@/hooks/useTwoFactorCheck";
import FeeProducts from "./components/FeeProducts";

export default function TransactionFeesPage() {
  const router = useRouter();
  const { checkAndRedirect } = useTwoFactorCheck();
  const [isLoading, setIsLoading] = useState(false);
  const [fees, setFees] = useState<TransactionFee[]>([]);
  const [editingFee, setEditingFee] = useState<TransactionFee | null>(null);
  const [activeTab, setActiveTab] = useState("view-fees");
  const [filters, setFilters] = useState<FeeFiltersType>({
    feeName: "",
    feeType: "all",
    applicableTo: "all",
    status: "all",
  });
  
  const isMobile = useIsMobile();

  // Load fees on component mount and when filters change
  useEffect(() => {
    const loadFees = async () => {
      setIsLoading(true);
      try {
        const data = await feesApi.getAll(filters);
        setFees(data);
      } catch (error) {
        console.error("Error loading fees:", error);
        toast.error("Failed to load transaction fees");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFees();
  }, [filters]);

  const handleCreateFee = async (feeData: Omit<TransactionFee, "id" | "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    try {
      const newFee = await feesApi.create(feeData);
      setFees((prevFees) => [...prevFees, newFee]);
      toast.success("Transaction fee created successfully");
      setActiveTab("view-fees");
    } catch (error) {
      console.error("Error creating fee:", error);
      toast.error("Failed to create transaction fee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFee = async (feeData: Omit<TransactionFee, "id" | "createdAt" | "updatedAt">) => {
    if (!editingFee) return;
    
    setIsLoading(true);
    try {
      const updatedFee = await feesApi.update(editingFee.id, feeData);
      
      if (updatedFee) {
        setFees((prevFees) =>
          prevFees.map((fee) => (fee.id === editingFee.id ? updatedFee : fee))
        );
        toast.success("Transaction fee updated successfully");
        setActiveTab("view-fees");
        setEditingFee(null);
      }
    } catch (error) {
      console.error("Error updating fee:", error);
      toast.error("Failed to update transaction fee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFee = async (id: string) => {
    setIsLoading(true);
    try {
      const success = await feesApi.delete(id);
      
      if (success) {
        setFees((prevFees) => prevFees.filter((fee) => fee.id !== id));
        toast.success("Transaction fee deleted successfully");
      } else {
        toast.error("Transaction fee not found");
      }
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast.error("Failed to delete transaction fee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFee = (fee: TransactionFee) => {
    setEditingFee(fee);
    setActiveTab("edit-fee");
  };

  const handleFilterChange = (newFilters: FeeFiltersType) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({
      feeName: "",
      feeType: "all",
      applicableTo: "all",
      status: "all",
    });
  };

  const handleCancelEdit = () => {
    setEditingFee(null);
    setActiveTab("view-fees");
  };

  const handleTabChange = async (value: string) => {
    if (value === "create-fee") {
      const canProceed = await checkAndRedirect();
      if (!canProceed) {
        return;
      }
    }
    setActiveTab(value);
  };

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push("/admin/businesses")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Businesses
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Transaction Fees</h1>
          <p className="text-gray-500 mb-6">Manage your transaction fee structure</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="view-fees">View Fees</TabsTrigger>
                <TabsTrigger value="fee-products">Fee Products</TabsTrigger>
                {editingFee && <TabsTrigger value="edit-fee">Edit Fee</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="view-fees">
                <FeeFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
                />
                <FeesTable
                  fees={fees}
                  onEdit={handleEditFee}
                  onDelete={handleDeleteFee}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="fee-products">
                <FeeProducts />
              </TabsContent>
              
              <TabsContent value="edit-fee">
                {editingFee && (
                  <FeeForm
                    initialData={editingFee}
                    onSubmit={handleUpdateFee}
                    onCancel={handleCancelEdit}
                    isLoading={isLoading}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}