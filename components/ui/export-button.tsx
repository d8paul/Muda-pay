"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { exportService, ExportField, ExportOptions } from "@/utils/exportService"
import toast from "react-hot-toast"

interface ExportButtonProps {
  data: any[]
  fields: ExportField[]
  filename: string
  title?: string
  dateRange?: {
    from?: Date | string
    to?: Date | string
  }
  summary?: {
    label: string
    value: string | number
  }[]
  disabled?: boolean
  className?: string
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fields,
  filename,
  title,
  dateRange,
  summary,
  disabled = false,
  className = "",
}) => {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (data.length === 0) {
      toast.error("No data to export")
      return
    }

    setIsExporting(true)
    
    try {
      const exportOptions: ExportOptions = {
        filename,
        title,
        fields,
        data,
        dateRange,
        summary,
      }

      exportService.export(format, exportOptions)
      
      toast.success(`Report exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error(`Failed to export report as ${format.toUpperCase()}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isExporting || data.length === 0}
          className={className}
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={isExporting}
        >
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExportButton
