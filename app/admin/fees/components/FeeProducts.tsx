"use client";

import { useState, useEffect } from "react";
import { get, put } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth";
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProgressBar from "@/components/ui/progress-bar";

interface FeeProduct {
  product_id: number;
  product_name: string;
  product_code: string;
  transaction_type: string;
  status: string;
  currency: string;
  fee_type: string;
  fee_amount: number;
  created_at: string;
}

export default function FeeProducts() {
  const [products, setProducts] = useState<FeeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FeeProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FeeProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");

  // Initialize 2FA hook
  const { 
    show2FAModal, 
    setShow2FAModal, 
    isLoading: is2FALoading, 
    requireTwoFactorAuth, 
    handle2FASubmit 
  } = useTwoFactorAuth({
    onSuccess: () => {
      // Success is handled in performFeeProductUpdate
    },
    onError: (error) => {
      // Error is handled in performFeeProductUpdate
    }
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await get("/admin/fees/products");
      if (response.status === 200) {
        setProducts(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch fee products");
      }
    } catch (error) {
      console.error("Error loading fee products:", error);
      toast.error("Failed to load fee products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: FeeProduct) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleRowClick = (product: FeeProduct) => {
    setSelectedProduct(product);
    setIsDetailsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Prepare the payload for the API
    const payload = {
      status: editingProduct.status,
      fee_type: editingProduct.fee_type,
      fee_amount: editingProduct.fee_amount
    };

    // Use 2FA flow for fee product update
    await requireTwoFactorAuth(payload, performFeeProductUpdate);
  };

  // Function that performs the actual fee product update (called after 2FA verification)
  const performFeeProductUpdate = async (data: any, token?: string) => {
    if (!editingProduct) return;
    
    setIsLoading(true);
    try {
      // Include 2FA token in payload if provided
      const payload = token ? { ...data, token } : data;
      
      // API call to update fee product
      await put(`/admin/fees/products/${editingProduct.product_id}`, payload);
      
      // Success handling
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast.success("Fee product updated successfully");
      
      // Refresh the products list
      await loadProducts();
    } catch (error) {
      console.error("Error updating fee product:", error);
      toast.error("Failed to update fee product");
      throw error; // Important to throw the error so the hook can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.transaction_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesTransactionType = transactionTypeFilter === "all" || product.transaction_type === transactionTypeFilter;
    const matchesCurrency = currencyFilter === "all" || product.currency === currencyFilter;

    return matchesSearch && matchesStatus && matchesTransactionType && matchesCurrency;
  });

  const uniqueTransactionTypes = Array.from(new Set(products.map(p => p.transaction_type)));
  const uniqueCurrencies = Array.from(new Set(products.map(p => p.currency)));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fee Products</h2>
        <div className="flex gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTransactionTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {uniqueCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Fee Amount</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow 
                  key={product.product_id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(product)}
                >
                  <TableCell>{product.product_id}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.product_code}</TableCell>
                  <TableCell>{product.transaction_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell>{product.currency}</TableCell>
                  <TableCell>{product.fee_type}</TableCell>
                  <TableCell>{product.fee_amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editingProduct.status}
                  onValueChange={(value) =>
                    setEditingProduct({ ...editingProduct, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Fee Type</label>
                <Select
                  value={editingProduct.fee_type}
                  onValueChange={(value) =>
                    setEditingProduct({ ...editingProduct, fee_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Fee Amount</label>
                <Input
                  type="number"
                  value={editingProduct.fee_amount}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      fee_amount: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || is2FALoading}>
                  {isLoading || is2FALoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fee Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product ID</label>
                  <p className="mt-1">{selectedProduct.product_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1">{selectedProduct.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Code</label>
                  <p className="mt-1">{selectedProduct.product_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                  <p className="mt-1">{selectedProduct.transaction_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedProduct.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="mt-1">{selectedProduct.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fee Type</label>
                  <p className="mt-1">{selectedProduct.fee_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fee Amount</label>
                  <p className="mt-1">{selectedProduct.fee_amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1">{new Date(selectedProduct.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    handleEdit(selectedProduct);
                  }}
                >
                  Edit Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <TwoFactorAuthDialog
        open={show2FAModal}
        onOpenChange={setShow2FAModal}
        onSubmit={handle2FASubmit}
        isLoading={is2FALoading}
      />
    </div>
  );
} 