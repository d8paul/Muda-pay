import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

interface FeesReportItem {
  id: number;
  transId: string;
  send_asset: string;
  send_amount: string;
  receive_currency: string;
  receive_amount: number;
  ex_rate: string;
  account_number: string;
  status: string;
  pay_in_status: string;
  fee: string;
  created_on: string;
  narration: string | null;
  provider_id: string;
  company_id: number;
  service_id: string;
  receiver_address: string;
  sending_address: string;
  response_body: any;
  reason: string | null;
  bank_name: string;
  bank_code: string;
  provider_ref_id: string;
  provider_address: string;
  provider_memo: string;
  payment_method_id: string;
  hash: string | null;
}

interface FeesReportTableProps {
  items: FeesReportItem[];
  isLoading: boolean;
}

interface FilterState {
  sendAsset: string;
  receiveCurrency: string;
  status: string;
  payInStatus: string;
  accountNumber: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "SUCCESSFUL":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "EXPIRED":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const getPayInStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "SUCCESSFUL":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "FAILED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const FeesReportTable = ({ items, isLoading }: FeesReportTableProps) => {
  const [selectedItem, setSelectedItem] = useState<FeesReportItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<FilterState>({
    sendAsset: "all",
    receiveCurrency: "all",
    status: "all",
    payInStatus: "all",
    accountNumber: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const uniqueSendAssets = Array.from(new Set(items.map(item => item.send_asset)));
  const uniqueReceiveCurrencies = Array.from(new Set(items.map(item => item.receive_currency)));
  const uniqueStatuses = Array.from(new Set(items.map(item => item.status)));
  const uniquePayInStatuses = Array.from(new Set(items.map(item => item.pay_in_status)));

  const filteredItems = items.filter(item => {
    const matchesSendAsset = filters.sendAsset === "all" || item.send_asset === filters.sendAsset;
    const matchesReceiveCurrency = filters.receiveCurrency === "all" || item.receive_currency === filters.receiveCurrency;
    const matchesStatus = filters.status === "all" || item.status === filters.status;
    const matchesPayInStatus = filters.payInStatus === "all" || item.pay_in_status === filters.payInStatus;
    const matchesAccountNumber = !filters.accountNumber || item.account_number.includes(filters.accountNumber);
    
    const itemDate = new Date(item.created_on);
    const matchesDateRange = (!filters.dateRange.from || itemDate >= filters.dateRange.from) &&
                           (!filters.dateRange.to || itemDate <= filters.dateRange.to);

    return matchesSendAsset && matchesReceiveCurrency && matchesStatus && 
           matchesPayInStatus && matchesAccountNumber && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setFilters({
      sendAsset: "all",
      receiveCurrency: "all",
      status: "all",
      payInStatus: "all",
      accountNumber: "",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow">
        <div className="flex-1 min-w-[200px]">
          <Label>Send Asset</Label>
          <Select
            value={filters.sendAsset}
            onValueChange={(value) => setFilters(prev => ({ ...prev, sendAsset: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Assets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {uniqueSendAssets.map(asset => (
                <SelectItem key={asset} value={asset}>{asset}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label>Receive Currency</Label>
          <Select
            value={filters.receiveCurrency}
            onValueChange={(value) => setFilters(prev => ({ ...prev, receiveCurrency: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {uniqueReceiveCurrencies.map(currency => (
                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label>Account Number</Label>
          <Input
            placeholder="Search account number"
            value={filters.accountNumber}
            onChange={(e) => setFilters(prev => ({ ...prev, accountNumber: e.target.value }))}
          />
        </div>

        <div className="w-full lg:w-auto">
          <Label>Date Range</Label>
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`w-full sm:w-[180px] justify-start text-left font-normal ${!filters.dateRange.from && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "MMM d, yyyy")
                  ) : (
                    <span>From</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: date } }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`w-full sm:w-[180px] justify-start text-left font-normal ${!filters.dateRange.to && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "MMM d, yyyy")
                  ) : (
                    <span>To</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: date } }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label>Pay-in Status</Label>
          <Select
            value={filters.payInStatus}
            onValueChange={(value) => setFilters(prev => ({ ...prev, payInStatus: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Pay-in Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pay-in Statuses</SelectItem>
              {uniquePayInStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Send Asset</TableHead>
              <TableHead>Send Amount</TableHead>
              <TableHead>Receive Currency</TableHead>
              <TableHead>Receive Amount</TableHead>
              <TableHead>Exchange Rate</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pay-in Status</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Created On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading fees report...</p>
                  ) : (
                    <p className="text-muted-foreground">No fees report data found</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow 
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedItem(item)}
                >
                  <TableCell>{item.send_asset}</TableCell>
                  <TableCell>{formatCurrency(item.send_amount)}</TableCell>
                  <TableCell>{item.receive_currency}</TableCell>
                  <TableCell>{formatCurrency(item.receive_amount)}</TableCell>
                  <TableCell>{formatCurrency(item.ex_rate)}</TableCell>
                  <TableCell>{item.account_number}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(item.status)}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getPayInStatusColor(item.pay_in_status)}
                    >
                      {item.pay_in_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(item.fee)}</TableCell>
                  <TableCell>{formatDate(item.created_on)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Transaction Information</h3>
                <div className="space-y-2">
                  <div>
                    <Label>Transaction ID</Label>
                    <p className="text-sm">{selectedItem.transId}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Pay-in Status</Label>
                    <p className="text-sm">{selectedItem.pay_in_status}</p>
                  </div>
                  <div>
                    <Label>Created On</Label>
                    <p className="text-sm">{formatDate(selectedItem.created_on)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Transfer Details</h3>
                <div className="space-y-2">
                  <div>
                    <Label>Send Asset</Label>
                    <p className="text-sm">{selectedItem.send_asset}</p>
                  </div>
                  <div>
                    <Label>Send Amount</Label>
                    <p className="text-sm">{formatCurrency(selectedItem.send_amount)}</p>
                  </div>
                  <div>
                    <Label>Receive Currency</Label>
                    <p className="text-sm">{selectedItem.receive_currency}</p>
                  </div>
                  <div>
                    <Label>Receive Amount</Label>
                    <p className="text-sm">{formatCurrency(selectedItem.receive_amount)}</p>
                  </div>
                  <div>
                    <Label>Exchange Rate</Label>
                    <p className="text-sm">{formatCurrency(selectedItem.ex_rate)}</p>
                  </div>
                  <div>
                    <Label>Fee</Label>
                    <p className="text-sm">{formatCurrency(selectedItem.fee)}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <Label>Account Number</Label>
                      <p className="text-sm">{selectedItem.account_number}</p>
                    </div>
                    <div>
                      <Label>Service ID</Label>
                      <p className="text-sm">{selectedItem.service_id}</p>
                    </div>
                    <div>
                      <Label>Provider ID</Label>
                      <p className="text-sm">{selectedItem.provider_id}</p>
                    </div>
                    <div>
                      <Label>Company ID</Label>
                      <p className="text-sm">{selectedItem.company_id}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label>Receiver Address</Label>
                      <p className="text-sm break-all">{selectedItem.receiver_address}</p>
                    </div>
                    <div>
                      <Label>Sending Address</Label>
                      <p className="text-sm break-all">{selectedItem.sending_address}</p>
                    </div>
                    <div>
                      <Label>Provider Memo</Label>
                      <p className="text-sm">{selectedItem.provider_memo}</p>
                    </div>
                    <div>
                      <Label>Payment Method ID</Label>
                      <p className="text-sm">{selectedItem.payment_method_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesReportTable; 