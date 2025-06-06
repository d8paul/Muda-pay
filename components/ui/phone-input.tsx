"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { africanCountryCodes, CountryCode, formatPhoneNumber, getDefaultCountry } from "@/utils/countryCodes"

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  defaultCountry?: string
  className?: string
}

export function PhoneInput({
  value = "",
  onChange,
  defaultCountry,
  className = "",
  ...props
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(
    defaultCountry ? africanCountryCodes.find(c => c.code === defaultCountry) || getDefaultCountry() : getDefaultCountry()
  )

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value, selectedCountry.dialCode)
    onChange?.(formattedNumber)
  }

  const handleCountryChange = (countryCode: string) => {
    const country = africanCountryCodes.find(c => c.code === countryCode) || getDefaultCountry()
    setSelectedCountry(country)
    
    // Reformat the existing number with the new country code
    if (value) {
      const formattedNumber = formatPhoneNumber(value, country.dialCode)
      onChange?.(formattedNumber)
    }
  }

  // Remove country code from display value
  const displayValue = value.startsWith(selectedCountry.dialCode)
    ? value.slice(selectedCountry.dialCode.length)
    : value

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>+{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {africanCountryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-gray-500">+{country.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={displayValue}
        onChange={handlePhoneChange}
        placeholder="Phone number"
        {...props}
      />
    </div>
  )
} 