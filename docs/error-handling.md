# Enhanced Error Handling Guide

## Overview

The API utility has been enhanced to better extract and handle error messages from your API responses, which follow the structure:
```typescript
{
  status: 400,
  message: "error message here"
}
```

## Automatic Error Handling

The axios interceptor automatically shows toast notifications for all API errors. The error message extraction function handles:

1. **Your API's specific structure**: `{status: 400, message: "error message"}`
2. **Standard error fields**: `message`, `error`, `detail`
3. **Validation error arrays**: Field-specific validation errors
4. **Validation error objects**: Key-value field errors
5. **Network errors**: Connection timeouts, network failures

## Usage Examples

### Basic Usage (Automatic Error Handling)
```typescript
import { get, post, put, del } from '@/utils/api'

// Error messages are automatically shown via toast
try {
  const response = await post('/admin/users', userData)
  // Success handling
} catch (error) {
  // Error toast is already shown automatically
  // Additional error handling if needed
}
```

### Manual Error Handling
```typescript
import { getErrorMessage, isValidationError, getValidationErrors } from '@/utils/api'

try {
  const response = await post('/admin/users', userData)
} catch (error) {
  // Get the error message manually
  const errorMessage = getErrorMessage(error)
  console.log('Error:', errorMessage)
  
  // Check if it's a validation error
  if (isValidationError(error)) {
    const validationErrors = getValidationErrors(error)
    console.log('Validation errors:', validationErrors)
    
    // Example: Show field-specific errors
    Object.entries(validationErrors).forEach(([field, messages]) => {
      console.log(`${field}: ${messages.join(', ')}`)
    })
  }
}
```

### Form Validation Example
```typescript
import { post, isValidationError, getValidationErrors } from '@/utils/api'

const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

const handleSubmit = async (formData: any) => {
  try {
    setFieldErrors({}) // Clear previous errors
    const response = await post('/admin/users', formData)
    // Success handling
  } catch (error) {
    if (isValidationError(error)) {
      const validationErrors = getValidationErrors(error)
      setFieldErrors(validationErrors)
    }
    // General error toast is shown automatically
  }
}

// In your JSX
<Input 
  {...props}
  className={fieldErrors.email ? 'border-red-500' : ''}
/>
{fieldErrors.email && (
  <p className="text-red-500 text-sm">{fieldErrors.email.join(', ')}</p>
)}
```

## Error Types Handled

### Your API Error Structure
```typescript
// Response: {status: 400, message: "User email already exists"}
// Extracted: "User email already exists"
```

### Validation Errors (Array)
```typescript
// Response: {status: 422, errors: [{field: "email", message: "Invalid email"}]}
// Extracted: "email: Invalid email"
```

### Validation Errors (Object)
```typescript
// Response: {status: 422, errors: {email: ["Invalid email", "Already taken"]}}
// Extracted: "email: Invalid email, Already taken"
```

### Network Errors
```typescript
// Connection timeout
// Extracted: "Request timeout. Please try again."

// Network failure
// Extracted: "Network error. Please check your connection."
```

## Utility Functions

### `getErrorMessage(error: any): string`
Extracts the error message from any error object.

### `isValidationError(error: any): boolean`
Checks if the error is a validation error (status 400 or 422).

### `getValidationErrors(error: any): Record<string, string[]>`
Returns validation errors organized by field name.

## Migration Notes

- **No breaking changes**: Existing error handling continues to work
- **Automatic toasts**: All API errors now show user-friendly toast messages
- **Enhanced extraction**: Better support for your API's error structure
- **Validation support**: Built-in handling for form validation errors

## Best Practices

1. **Let automatic handling work**: For most cases, just catch errors for additional logic
2. **Use validation utilities**: For forms, use `isValidationError()` and `getValidationErrors()`
3. **Provide fallbacks**: Always have fallback error messages for edge cases
4. **Log errors**: Keep console.error for debugging while users see friendly toasts
