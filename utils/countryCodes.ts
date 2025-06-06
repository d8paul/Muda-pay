export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const africanCountryCodes: CountryCode[] = [
  { name: "Uganda", code: "UG", dialCode: "256", flag: "🇺🇬" },
  { name: "Kenya", code: "KE", dialCode: "254", flag: "🇰🇪" },
  { name: "Tanzania", code: "TZ", dialCode: "255", flag: "🇹🇿" },
  { name: "Rwanda", code: "RW", dialCode: "250", flag: "🇷🇼" },
  { name: "Burundi", code: "BI", dialCode: "257", flag: "🇧🇮" },
  { name: "South Sudan", code: "SS", dialCode: "211", flag: "🇸🇸" },
  { name: "Ethiopia", code: "ET", dialCode: "251", flag: "🇪🇹" },
  { name: "Somalia", code: "SO", dialCode: "252", flag: "🇸🇴" },
  { name: "Djibouti", code: "DJ", dialCode: "253", flag: "🇩🇯" },
  { name: "Eritrea", code: "ER", dialCode: "291", flag: "🇪🇷" },
  { name: "Sudan", code: "SD", dialCode: "249", flag: "🇸🇩" },
  { name: "Egypt", code: "EG", dialCode: "20", flag: "🇪🇬" },
  { name: "Libya", code: "LY", dialCode: "218", flag: "🇱🇾" },
  { name: "Tunisia", code: "TN", dialCode: "216", flag: "🇹🇳" },
  { name: "Algeria", code: "DZ", dialCode: "213", flag: "🇩🇿" },
  { name: "Morocco", code: "MA", dialCode: "212", flag: "🇲🇦" },
  { name: "Mauritania", code: "MR", dialCode: "222", flag: "🇲🇷" },
  { name: "Senegal", code: "SN", dialCode: "221", flag: "🇸🇳" },
  { name: "Gambia", code: "GM", dialCode: "220", flag: "🇬🇲" },
  { name: "Guinea-Bissau", code: "GW", dialCode: "245", flag: "🇬🇼" },
  { name: "Guinea", code: "GN", dialCode: "224", flag: "🇬🇳" },
  { name: "Sierra Leone", code: "SL", dialCode: "232", flag: "🇸🇱" },
  { name: "Liberia", code: "LR", dialCode: "231", flag: "🇱🇷" },
  { name: "Côte d'Ivoire", code: "CI", dialCode: "225", flag: "🇨🇮" },
  { name: "Ghana", code: "GH", dialCode: "233", flag: "🇬🇭" },
  { name: "Togo", code: "TG", dialCode: "228", flag: "🇹🇬" },
  { name: "Benin", code: "BJ", dialCode: "229", flag: "🇧🇯" },
  { name: "Nigeria", code: "NG", dialCode: "234", flag: "🇳🇬" },
  { name: "Niger", code: "NE", dialCode: "227", flag: "🇳🇪" },
  { name: "Burkina Faso", code: "BF", dialCode: "226", flag: "🇧🇫" },
  { name: "Mali", code: "ML", dialCode: "223", flag: "🇲🇱" },
  { name: "Cameroon", code: "CM", dialCode: "237", flag: "🇨🇲" },
  { name: "Chad", code: "TD", dialCode: "235", flag: "🇹🇩" },
  { name: "Central African Republic", code: "CF", dialCode: "236", flag: "🇨🇫" },
  { name: "Equatorial Guinea", code: "GQ", dialCode: "240", flag: "🇬🇶" },
  { name: "Gabon", code: "GA", dialCode: "241", flag: "🇬🇦" },
  { name: "Republic of the Congo", code: "CG", dialCode: "242", flag: "🇨🇬" },
  { name: "Democratic Republic of the Congo", code: "CD", dialCode: "243", flag: "🇨🇩" },
  { name: "Angola", code: "AO", dialCode: "244", flag: "🇦🇴" },
  { name: "Namibia", code: "NA", dialCode: "264", flag: "🇳🇦" },
  { name: "Botswana", code: "BW", dialCode: "267", flag: "🇧🇼" },
  { name: "Zimbabwe", code: "ZW", dialCode: "263", flag: "🇿🇼" },
  { name: "Zambia", code: "ZM", dialCode: "260", flag: "🇿🇲" },
  { name: "Malawi", code: "MW", dialCode: "265", flag: "🇲🇼" },
  { name: "Mozambique", code: "MZ", dialCode: "258", flag: "🇲🇿" },
  { name: "Eswatini", code: "SZ", dialCode: "268", flag: "🇸🇿" },
  { name: "Lesotho", code: "LS", dialCode: "266", flag: "🇱🇸" },
  { name: "South Africa", code: "ZA", dialCode: "27", flag: "🇿🇦" },
  { name: "Madagascar", code: "MG", dialCode: "261", flag: "🇲🇬" },
  { name: "Comoros", code: "KM", dialCode: "269", flag: "🇰🇲" },
  { name: "Mauritius", code: "MU", dialCode: "230", flag: "🇲🇺" },
  { name: "Seychelles", code: "SC", dialCode: "248", flag: "🇸🇨" },
  { name: "Cape Verde", code: "CV", dialCode: "238", flag: "🇨🇻" },
  { name: "São Tomé and Príncipe", code: "ST", dialCode: "239", flag: "🇸🇹" }
];

export const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If the number already starts with the country code, return as is
  if (cleaned.startsWith(countryCode)) {
    return cleaned;
  }
  
  // If the number starts with 0, remove it and add the country code
  if (cleaned.startsWith('0')) {
    return countryCode + cleaned.substring(1);
  }
  
  // Otherwise, just prepend the country code
  return countryCode + cleaned;
};

export const getCountryByDialCode = (dialCode: string): CountryCode | undefined => {
  return africanCountryCodes.find(country => country.dialCode === dialCode);
};

export const getDefaultCountry = (): CountryCode => {
  return africanCountryCodes.find(country => country.code === "UG") || africanCountryCodes[0];
}; 