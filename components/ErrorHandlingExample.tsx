// Example component demonstrating enhanced error handling
import React, { useState } from 'react'
import { post, getErrorMessage, isValidationError, getValidationErrors } from '@/utils/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

export default function ErrorHandlingExample() {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setValidationErrors({}) // Clear previous errors

    try {
      // This will automatically show toast on error
      const response = await post('/example-endpoint', formData)
      toast.success('Success!')
    } catch (error) {
      // The API interceptor already showed a general error toast
      
      // Handle validation errors specifically
      if (isValidationError(error)) {
        const fieldErrors = getValidationErrors(error)
        setValidationErrors(fieldErrors)
        toast.error('Please fix the validation errors below')
      }
      
      // Example of manual error message extraction
      const errorMessage = getErrorMessage(error)
      console.log('Error details:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const simulateError = async (errorType: string) => {
    setIsLoading(true)
    try {
      // Simulate different error scenarios
      const endpoints = {
        'api-error': '/simulate-api-error',      // {status: 400, message: "Something went wrong"}
        'validation': '/simulate-validation',    // {status: 422, errors: {email: ["Invalid email"]}}
        'network': '/non-existent-endpoint'      // Network error
      }
      
      await post(endpoints[errorType as keyof typeof endpoints] || '/test', {})
    } catch (error) {
      if (isValidationError(error)) {
        setValidationErrors(getValidationErrors(error))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Error Handling Demo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={validationErrors.email ? 'border-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.email.join(', ')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={validationErrors.name ? 'border-red-500' : ''}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.name.join(', ')}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium">Test Error Scenarios:</p>
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('api-error')}
            disabled={isLoading}
          >
            Test API Error (status: 400)
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('validation')}
            disabled={isLoading}
          >
            Test Validation Error (status: 422)
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('network')}
            disabled={isLoading}
          >
            Test Network Error
          </Button>
        </div>
      </div>

      {/* Show current validation errors for debugging */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded">
          <p className="text-sm font-medium text-red-800">Validation Errors:</p>
          <pre className="text-xs text-red-600 mt-1">
            {JSON.stringify(validationErrors, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

/*
Example API responses this handles:

1. Your API Error Structure:
{
  "status": 400,
  "message": "User email already exists"
}
Result: Shows toast "User email already exists"

2. Validation Errors (Object):
{
  "status": 422,
  "errors": {
    "email": ["Invalid email format", "Email already taken"],
    "name": ["Name is required"]
  }
}
Result: Shows field-specific errors + general toast

3. Validation Errors (Array):
{
  "status": 422,
  "errors": [
    {"field": "email", "message": "Invalid email"},
    {"field": "name", "message": "Name too short"}
  ]
}
Result: Shows field-specific errors + general toast

4. Network Errors:
Connection timeout, network failure, etc.
Result: Shows "Network error. Please check your connection."
*/
