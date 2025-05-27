"use client"

import { forwardRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholderText?: string
  className?: string
}

export const DatePickerComponent = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ selected, onChange, placeholderText, className, ...props }, ref) => {
    return (
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)

DatePickerComponent.displayName = "DatePicker" 