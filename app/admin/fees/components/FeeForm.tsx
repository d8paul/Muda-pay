import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TransactionFee } from "@/lib/fees";

const formSchema = z.object({
  feeName: z.string().min(2, {
    message: "Fee name must be at least 2 characters.",
  }),
  feeType: z.enum(["percentage", "fixed"]),
  feeValue: z.coerce.number().positive({
    message: "Fee value must be a positive number.",
  }),
  minAmount: z.coerce.number().min(0, {
    message: "Minimum amount cannot be negative.",
  }),
  maxAmount: z.coerce
    .number()
    .nullable()
    .refine((val) => val === null || val > 0, {
      message: "Maximum amount must be positive or empty for no limit.",
    }),
  applicableTo: z.enum(["deposit", "withdrawal", "transfer", "all"]),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

interface FeeFormProps {
  initialData?: TransactionFee | null;
  onSubmit: (data: Omit<TransactionFee, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const FeeForm = ({ initialData, onSubmit, onCancel, isLoading }: FeeFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feeName: initialData?.feeName || "",
      feeType: initialData?.feeType || "percentage",
      feeValue: initialData?.feeValue || 0,
      minAmount: initialData?.minAmount || 0,
      maxAmount: initialData?.maxAmount || null,
      applicableTo: initialData?.applicableTo || "all",
      status: initialData?.status || "active",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        feeName: initialData.feeName,
        feeType: initialData.feeType,
        feeValue: initialData.feeValue,
        minAmount: initialData.minAmount,
        maxAmount: initialData.maxAmount,
        applicableTo: initialData.applicableTo,
        status: initialData.status,
      });
    } else {
      form.reset({
        feeName: "",
        feeType: "percentage",
        feeValue: 0,
        minAmount: 0,
        maxAmount: null,
        applicableTo: "all",
        status: "active",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Transaction Fee" : "Create company Transaction Fee"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update the details of the existing transaction fee"
            : "Configure a new transaction fee for your system"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="feeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter fee name" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="feeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("feeType") === "percentage" ? "Percentage Value (%)" : "Fixed Amount (UGX)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={form.watch("feeType") === "percentage" ? "0.01" : "1"}
                        {...field}
                        disabled={isLoading}
                        placeholder={form.watch("feeType") === "percentage" ? "e.g. 1.5" : "e.g. 5000"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Amount (UGX)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={isLoading}
                        placeholder="Minimum transaction amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Amount (UGX)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                        disabled={isLoading}
                        placeholder="Leave empty for no limit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="applicableTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicable To</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Determine if this fee is currently active in the system
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "active"}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? "active" : "inactive");
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#26a0ff] hover:bg-[#26a0ff]"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : initialData ? "Update Fee" : "Create Fee"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default FeeForm;