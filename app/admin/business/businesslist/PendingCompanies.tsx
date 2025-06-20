"use client";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import { UsersIcon } from "@heroicons/react/24/outline";
import { get, put } from "@/utils/api";
import toast from "react-hot-toast";
import { usePermissions } from '@/app/hooks/usePermissions';
import { useUser } from '@/contexts/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TwoFactorAuthDialog from "@/components/TwoFactorAuthDialog";

interface Business {
    id: string;
    maker_id: string;
    checker_id: string | null;
    entry_type: string;
    status: string;
    reason: string | null;
    data_content: {
        client_id: string;
        business_name: string;
        contact_email: string;
        phone_number: string;
        address: string;
        contact_person_name: string;
        contact_phone: string;
        status: string;
    };
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface PendingCompaniesProps {
    onBusinessApproved?: () => void;
}

export default function PendingCompanies({ onBusinessApproved }: PendingCompaniesProps) {
    const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [phoneFilter, setPhoneFilter] = useState("");
    const [regFilter, setRegFilter] = useState("");
    const [isApproving, setIsApproving] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [businessToReject, setBusinessToReject] = useState<string | null>(null);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [businessToApprove, setBusinessToApprove] = useState<string | null>(null);
    const [show2FARejectModal, setShow2FARejectModal] = useState(false);
    const { hasPermission } = usePermissions();
    const { loading: userLoading } = useUser();

    // Only fetch on mount and after approval
    useEffect(() => {
        fetchPendingBusinesses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPendingBusinesses = async () => {
        setIsLoading(true);
        try {
            const response = await get("/admin/businesses/pending");
            if (response.status === 200 && Array.isArray(response.data)) {
                setPendingBusinesses(response.data);
            } else {
                setPendingBusinesses([]);
            }
        } catch (error) {
            toast.error("Failed to fetch pending companies");
            setPendingBusinesses([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveCompany = async (businessId: string) => {
        // if (!hasPermission("business.approve")) {
        //     toast.error("You do not have permission to approve companies.");
        //     return;
        // }
        
        // Show 2FA modal first
        setBusinessToApprove(businessId);
        setShow2FAModal(true);
    };

    const confirmApproveCompany = async (twoFactorToken: string) => {
        if (!businessToApprove) return;
        
        setIsApproving(businessToApprove);
        try {
            const response = await put(`/admin/businesses/${businessToApprove}/add/approve`, {
                status: "approved",
                token: twoFactorToken
            });
            if (response.status === 200) {
                toast.success("Company approved successfully");
                await fetchPendingBusinesses();
                // Refresh the main business list
                if (onBusinessApproved) {
                    onBusinessApproved();
                }
                setShow2FAModal(false);
                setBusinessToApprove(null);
            } else {
                toast.error("Failed to approve company");
            }
        } catch (error) {
            toast.error("An error occurred while approving company");
        } finally {
            setIsApproving(null);
        }
    };

    const handleRejectCompany = async (twoFactorToken: string) => {
        if (!businessToReject) return;
        
        // if (!hasPermission("business.approve")) {
        //     toast.error("You do not have permission to reject companies.");
        //     return;
        // }
        
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }
        
        setIsRejecting(businessToReject);
        try {
            const response = await put(`/admin/businesses/${businessToReject}/add/approve`, {
                status: "rejected",
                reason: rejectReason,
                token: twoFactorToken
            });
            if (response.status === 200) {
                toast.success("Company rejected successfully");
                await fetchPendingBusinesses();
                // Refresh the main business list
                if (onBusinessApproved) {
                    onBusinessApproved();
                }
                setShow2FARejectModal(false);
                setShowRejectDialog(false);
                setRejectReason("");
                setBusinessToReject(null);
            } else {
                toast.error("Failed to reject company");
            }
        } catch (error) {
            toast.error("An error occurred while rejecting company");
        } finally {
            setIsRejecting(null);
        }
    };

    const openRejectDialog = (businessId: string) => {
        setBusinessToReject(businessId);
        setShowRejectDialog(true);
    };

    const handleRejectDialogConfirm = () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }
        // Close the reject dialog and show 2FA modal
        setShowRejectDialog(false);
        setShow2FARejectModal(true);
    };

    const filteredPendingBusinesses = pendingBusinesses.filter(
        (business) =>
            (business.data_content?.business_name?.toLowerCase().includes(filter.toLowerCase()) ||
                business.data_content?.contact_email?.toLowerCase().includes(filter.toLowerCase())) &&
            business.data_content?.phone_number?.toLowerCase().includes(phoneFilter.toLowerCase()) &&
            business.data_content?.contact_person_name?.toLowerCase().includes(regFilter.toLowerCase())
    );

    const clearFilters = () => {
        setFilter("");
        setPhoneFilter("");
        setRegFilter("");
    };

    // Show loading state while user data is being fetched to prevent hydration mismatch
    if (userLoading) {
        return (
            <>
                <Card className="p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                    </div>
                </Card>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    <div className="flex justify-center items-center py-4">
                                        <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </>
        );
    }

    return (
        <>
            {/* ...existing code... */}
            <Card className="p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Filter businesses..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Input
                        type="text"
                        placeholder="Phone number..."
                        value={phoneFilter}
                        onChange={(e) => setPhoneFilter(e.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder="Contact person..."
                        value={regFilter}
                        onChange={(e) => setRegFilter(e.target.value)}
                    />
                </div>
                {(filter || phoneFilter || regFilter) && (
                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                )}
            </Card>
            <Card>                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    <div className="flex justify-center items-center py-4">
                                        <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredPendingBusinesses.length > 0 ? (
                            filteredPendingBusinesses.map((business) => (
                                <TableRow key={business.id}>
                                    <TableCell>{business.data_content?.business_name}</TableCell>
                                    <TableCell>{business.data_content?.contact_email}</TableCell>
                                    <TableCell>{business.data_content?.phone_number}</TableCell>
                                    <TableCell>{business.data_content?.contact_person_name}</TableCell>
                                    <TableCell>{business.data_content?.address}</TableCell>
                                    <TableCell>
                                        {/* {hasPermission("business.approve") && ( */}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleApproveCompany(business.id)}
                                                    disabled={isApproving === business.id || isRejecting === business.id}
                                                >
                                                    {isApproving === business.id ? "Approving..." : "Approve"}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => openRejectDialog(business.id)}
                                                    disabled={isApproving === business.id || isRejecting === business.id}
                                                >
                                                    {isRejecting === business.id ? "Rejecting..." : "Reject"}
                                                </Button>
                                            </div>
                                        {/* )} */}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                                        <UsersIcon className="h-12 w-12 text-gray-400" />
                                        <p className="text-lg font-medium text-gray-500">No pending businesses found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Business Application</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reject-reason">Reason for rejection</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Please provide a reason for rejecting this business application..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowRejectDialog(false);
                                setRejectReason("");
                                setBusinessToReject(null);
                            }}
                            disabled={isRejecting !== null}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleRejectDialogConfirm}
                            disabled={isRejecting !== null || !rejectReason.trim()}
                        >
                            Continue to 2FA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Two Factor Authentication Modal for Approval */}
            <TwoFactorAuthDialog
                open={show2FAModal}
                onOpenChange={setShow2FAModal}
                onSubmit={confirmApproveCompany}
                isLoading={isApproving !== null}
            />

            {/* Two Factor Authentication Modal for Rejection */}
            <TwoFactorAuthDialog
                open={show2FARejectModal}
                onOpenChange={(open) => {
                    setShow2FARejectModal(open);
                    if (!open) {
                        // If 2FA modal is closed, also reset the rejection state
                        setRejectReason("");
                        setBusinessToReject(null);
                    }
                }}
                onSubmit={handleRejectCompany}
                isLoading={isRejecting !== null}
            />
        </>
    );
}

  