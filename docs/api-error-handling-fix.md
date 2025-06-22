# API Error Handling Fix: Simplified Non-200 Status Check

## Issue Description

When rejecting a pending deposit, the network response shows:

- **HTTP Status Code**: 200 (OK)
- **Response Body**: `{"status":400,"message":"Pending deposit not found"}`

The application was incorrectly treating this as a successful request because it was only checking the HTTP status code (200) and ignoring the application-level error status in the response body (400).

## Root Cause

Your API follows a pattern where:

1. **HTTP Status Code** always returns 200 for successful HTTP requests
2. **Application Status** is returned in the response body as `{status: number, message: string}`

The application was not checking the `status` field in the response body for errors.

## Solution

### What Was Fixed

Added a simplified `checkResponseError` helper function to both API utility files that:

1. **Checks the response body** for `status` field
2. **Shows error notification** if `status !== 200`
3. **Throws an error** to maintain proper error flow
4. **Keeps error handling simple** - removed complex validation error parsing

### Code Changes

#### Before

```typescript
export const put = async (url: string, data = {}) => {
  try {
    const response = await api.put(url, data)
    return response.data  // Directly returned response.data, ignoring status field
  } catch (error) {
    console.error("PUT request failed:", error)
    throw error
  }
}
```

#### After

```typescript
// Helper function to check response status and show notification for non-200 status
const checkResponseError = (responseData: any) => {
  // Check if the response body contains a non-200 status
  if (responseData && typeof responseData.status === 'number' && responseData.status !== 200) {
    // Show error notification
    const message = responseData.message || `Request failed with status ${responseData.status}`
    toast.error(message)
    
    // Throw error to maintain error handling flow
    const error = {
      response: {
        data: responseData
      },
      status: responseData.status,
      message: message
    }
    throw error
  }
  return responseData
}

export const put = async (url: string, data = {}) => {
  try {
    const response = await api.put(url, data)
    return checkResponseError(response.data)  // Now checks for non-200 status
  } catch (error) {
    console.error("PUT request failed:", error)
    throw error
  }
}
```

### Files Modified

1. `/utils/api.ts` - Main API utility
2. `/utils/stage_api.ts` - Stage API utility

## How It Works Now

### Successful Response

```json
// HTTP Status: 200
// Response Body:
{
  "status": 200,
  "message": "Success",
  "data": {...}
}
// Result: Returns response data normally
```

### Application Error Response

```json
// HTTP Status: 200
// Response Body:
{
  "status": 400,
  "message": "Pending deposit not found"
}
// Result: Shows toast "Pending deposit not found", throws error for proper error flow
```

### HTTP Error Response

```json
// HTTP Status: 500
// Response Body: (any)
// Result: Axios throws error, interceptor shows appropriate error message
```

## Additional Issues Found and Fixed

### Modal Not Closing on Error

**Problem**: When the API returned an error, the reject deposit modal stayed open because the 2FA flow was interrupted.

**Solution**: Added proper error handling in the `RejectDepositDialog` component with an `onError` callback that closes the modal and resets state when errors occur.

### Duplicate Error Messages

**Problem**: Both the checkResponseError function and the 2FA hook were showing error toasts, resulting in duplicate notifications.

**Solution**: Updated the `useTwoFactorAuth` hook to:

1. Remove its own `toast.error()` call in the error handler
2. Close the 2FA modal even on errors
3. Let the checkResponseError function handle error message display
4. Allow the `onError` callback to handle modal cleanup

### Additional Files Modified

1. `/app/admin/deposits/pending/components/RejectDepositDialog.tsx` - Added `onError` callback
2. `/hooks/useTwoFactorAuth.ts` - Removed duplicate error toast, improved error flow

## Complete Error Flow Now

1. **API Call**: `PUT /admin/deposits/{id}/approve` with rejection data
2. **API Response**: HTTP 200 with `{status: 400, message: "Pending deposit not found"}`
3. **checkResponseError()**: Detects status !== 200, shows toast, throws error
4. **2FA Hook**: Catches error, calls `onError` callback, closes modal
5. **RejectDepositDialog**: `onError` callback closes dialog and resets state

Result: ✅ Error message shown, ✅ Modal closes, ✅ State properly reset

## Benefits

1. **Simple Error Handling**: Only checks for non-200 status codes, no complex validation parsing
2. **Automatic Toast Messages**: Application errors trigger toast notifications immediately
3. **Backwards Compatible**: Existing code continues to work
4. **Clear Error Flow**: Single responsibility - show notification and throw error

## Testing

To verify the fix works:

1. Try rejecting a non-existent pending deposit
2. You should see a toast error message: "Pending deposit not found"
3. The modal should close automatically
4. The action should be treated as failed, not successful

## Impact on Existing Code

This change is **backwards compatible**. Existing code will continue to work because:

- Successful responses (status 200) pass through unchanged
- Only non-200 responses show error notifications and throw errors
- The error structure matches what components expect
