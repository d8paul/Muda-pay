"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { get, put } from "@/utils/api"
import ProgressBar from "@/components/ProgressBar"
import toast from "react-hot-toast"
import { Pencil } from "lucide-react"

interface FeesTabProps {
  clientId: string
}

interface Charge {
  id: number
  chain: string
  chain_code: string
  gas_fee: string
  muda_charge: string
  charge_type: string
  fee: string
}

interface EditFormData {
  gas_fee: string
  muda_charge: string
  charge_type: string
}

const FeesTab = ({ clientId }: FeesTabProps) => {
  const [charges, setCharges] = useState<Charge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    gas_fee: "",
    muda_charge: "",
    charge_type: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCharges()
  }, [])

  const fetchCharges = async () => {
    setIsLoading(true)
    try {
      const response = await get("/admin/liqudityrail/charges")
      console.log("Charges response:", response)
      
      if (response.status === 200 && response.data && response.data.items) {
        setCharges(Array.isArray(response.data.items) ? response.data.items : [])
      } else {
        throw new Error(response.data?.message || 'Failed to fetch charges')
      }
    } catch (error) {
      console.error("Error fetching charges:", error)
      toast.error("Failed to fetch charges data")
      setCharges([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (charge: Charge) => {
    setSelectedCharge(charge)
    setEditFormData({
      gas_fee: charge.gas_fee.toString(),
      muda_charge: charge.muda_charge.toString(),
      charge_type: charge.charge_type
    })
    setIsEditDialogOpen(true)
  }

  const handleFormChange = (key: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCharge) return

    setIsSubmitting(true)
    try {
      const updateData = {
        charge_type: editFormData.charge_type,
        muda_charge: editFormData.muda_charge,
        gas_fee: editFormData.gas_fee
      }

      const response = await put(`/admin/liqudityrail/charges/${selectedCharge.id}`, updateData)
      
      if (response.status === 200) {
        toast.success("Charge updated successfully")
        setIsEditDialogOpen(false)
        fetchCharges() // Refresh the data
      } else {
        throw new Error(response.data?.message || 'Failed to update charge')
      }
    } catch (error: any) {
      console.error("Error updating charge:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update charge"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedCharge(null)
    setEditFormData({
      gas_fee: "",
      muda_charge: "",
      charge_type: ""
    })
  }

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Liquidity Rail Fee Charges</h3>
            <p className="text-sm text-gray-600">Manage liquidity rail blockchain network fees and charges</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Block Fee USD</TableHead>
              <TableHead>Muda Charges</TableHead>
              <TableHead>Charge Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {isLoading ? "Loading charges..." : "No charges found"}
                </TableCell>
              </TableRow>
            ) : (
              charges.map((charge) => (
                <TableRow key={charge.id}>
                  <TableCell className="font-medium">{charge.chain_code}</TableCell>
                  <TableCell>{charge.chain}</TableCell>
                  <TableCell>{parseFloat(charge.gas_fee).toFixed(4)}</TableCell>
                  <TableCell>{parseFloat(charge.muda_charge).toFixed(4)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {charge.charge_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(charge)}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Charge</DialogTitle>
            </DialogHeader>
            {selectedCharge && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Asset</Label>
                    <p className="mt-1 text-sm">{selectedCharge.chain_code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Network</Label>
                    <p className="mt-1 text-sm">{selectedCharge.chain}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gas_fee" className="text-sm font-medium">
                      Block Fee USD (Gas Fee)
                    </Label>
                    <Input
                      id="gas_fee"
                      type="number"
                      step="0.0001"
                      value={editFormData.gas_fee}
                      onChange={(e) => handleFormChange("gas_fee", e.target.value)}
                      placeholder="Enter gas fee"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="muda_charge" className="text-sm font-medium">
                      Muda Charges
                    </Label>
                    <Input
                      id="muda_charge"
                      type="number"
                      step="0.0001"
                      value={editFormData.muda_charge}
                      onChange={(e) => handleFormChange("muda_charge", e.target.value)}
                      placeholder="Enter muda charge"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="charge_type" className="text-sm font-medium">
                      Charge Type
                    </Label>
                    <Select 
                      value={editFormData.charge_type} 
                      onValueChange={(value) => handleFormChange("charge_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select charge type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="dynamic">Dynamic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Charge"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default FeesTab 