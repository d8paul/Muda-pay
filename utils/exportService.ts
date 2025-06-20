import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Define custom autoTable options interface
interface AutoTableOptions {
  head?: any[][]
  body?: any[][]
  startY?: number
  styles?: {
    fontSize?: number
    cellPadding?: number
  }
  headStyles?: {
    fillColor?: number[]
    textColor?: number
    fontStyle?: string
  }
  alternateRowStyles?: {
    fillColor?: number[]
  }
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

export interface ExportField {
  key: string
  label: string
  type?: 'string' | 'number' | 'date' | 'currency'
  format?: (value: any) => string
}

export interface ExportOptions {
  filename: string
  title?: string
  fields: ExportField[]
  data: any[]
  dateRange?: {
    from?: Date | string
    to?: Date | string
  }
  summary?: {
    label: string
    value: string | number
  }[]
}

class ExportService {
  /**
   * Format value based on field type
   */
  private formatValue(value: any, field: ExportField): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A'
    }

    // Use custom format function if provided
    if (field.format) {
      return field.format(value)
    }

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleString()
      case 'currency':
        return parseFloat(value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      case 'number':
        return parseFloat(value).toLocaleString()
      default:
        return String(value)
    }
  }

  /**
   * Export data to Excel format
   */
  exportToExcel(options: ExportOptions): void {
    const { filename, title, fields, data, dateRange, summary } = options

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Prepare data for Excel
    const excelData: any[] = []

    // Add title if provided
    if (title) {
      excelData.push([title])
      excelData.push([]) // Empty row
    }

    // Add date range if provided
    if (dateRange && dateRange.from && dateRange.to) {
      const fromDate = typeof dateRange.from === 'string' ? new Date(dateRange.from) : dateRange.from
      const toDate = typeof dateRange.to === 'string' ? new Date(dateRange.to) : dateRange.to
      excelData.push([`Report Period: ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`])
      excelData.push([]) // Empty row
    }

    // Add summary if provided
    if (summary && summary.length > 0) {
      excelData.push(['Summary'])
      summary.forEach(item => {
        excelData.push([item.label, item.value])
      })
      excelData.push([]) // Empty row
    }

    // Add headers
    const headers = fields.map(field => field.label)
    excelData.push(headers)

    // Add data rows
    data.forEach(row => {
      const excelRow = fields.map(field => {
        const value = row[field.key]
        return this.formatValue(value, field)
      })
      excelData.push(excelRow)
    })

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    // Auto-size columns
    const colWidths = fields.map(field => ({ wch: Math.max(field.label.length, 15) }))
    worksheet['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

    // Save file
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  /**
   * Export data to PDF format
   */
  exportToPDF(options: ExportOptions): void {
    const { filename, title, fields, data, dateRange, summary } = options

    // Create PDF document
    const doc = new jsPDF()
    let yPosition = 20

    // Add title
    if (title) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 20, yPosition)
      yPosition += 15
    }

    // Add date range
    if (dateRange && dateRange.from && dateRange.to) {
      const fromDate = typeof dateRange.from === 'string' ? new Date(dateRange.from) : dateRange.from
      const toDate = typeof dateRange.to === 'string' ? new Date(dateRange.to) : dateRange.to
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Report Period: ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`, 20, yPosition)
      yPosition += 10
    }

    // Add summary
    if (summary && summary.length > 0) {
      yPosition += 5
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      summary.forEach(item => {
        doc.text(`${item.label}: ${item.value}`, 20, yPosition)
        yPosition += 8
      })
      yPosition += 10
    }

    // Prepare table data
    const tableHeaders = fields.map(field => field.label)
    const tableData = data.map(row => 
      fields.map(field => {
        const value = row[field.key]
        return this.formatValue(value, field)
      })
    )

    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    })

    // Save PDF
    doc.save(`${filename}.pdf`)
  }

  /**
   * Export data in the specified format
   */
  export(format: 'excel' | 'pdf', options: ExportOptions): void {
    switch (format) {
      case 'excel':
        this.exportToExcel(options)
        break
      case 'pdf':
        this.exportToPDF(options)
        break
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }
}

// Export singleton instance
export const exportService = new ExportService()
