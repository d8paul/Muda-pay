"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"
import Header from "../Header"

export default function DeveloperDocs() {
  const [isLiveEnvironment, setIsLiveEnvironment] = useState(false)

  const baseUrl = isLiveEnvironment ? "https://api.example.com/v1" : "https://api-test.example.com/v1"

  return (
    <div className="py-6">
          <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">API Documentation</h1>
        <p className="mt-2 text-gray-600">Complete documentation for integrating with our payment processing API</p>
        <Alert className="mt-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Current Environment: {isLiveEnvironment ? "Live" : "Test"}</AlertTitle>
          <AlertDescription>
            {isLiveEnvironment
              ? "You are viewing the documentation for the live environment. Use with caution."
              : "You are viewing the documentation for the test environment. Feel free to experiment."}
            You can switch between environments using the toggle in the top toolbar.
          </AlertDescription>
        </Alert>

        {/* Overview Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn how to integrate our payment processing API into your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Base URL</h3>
                  <code className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white">
                    {baseUrl}
                  </code>
                </div>

                <div>
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <p className="mt-2 text-gray-600">
                    All API requests must include your API key in the Authorization header. You can generate API keys in
                    the Settings section of your dashboard.{" "}
                    {isLiveEnvironment
                      ? "Use your live API key for production transactions."
                      : "Use your test API key for development and testing."}
                  </p>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Make sure to keep your API keys secure and never share them in publicly accessible areas such as
                    GitHub, client-side code, and so forth.{" "}
                    {isLiveEnvironment && "Be extra cautious with live API keys."}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Authentication Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Learn how to authenticate your API requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <p className="mt-2 text-gray-600">
                    Authentication is performed via HTTP Bearer Auth. Provide your {isLiveEnvironment ? "live" : "test"}{" "}
                    API key as the bearer token value in the Authorization header.
                  </p>
                  <code className="mt-4 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white">
                    Authorization: Bearer your_{isLiveEnvironment ? "live" : "test"}_api_key_here
                  </code>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Example Request</h3>
                  <pre className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                    {`curl -X POST ${baseUrl}/collections \\
  -H "Authorization: Bearer your_${isLiveEnvironment ? "live" : "test"}_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "currency": "UGX",
    "reference": "INV001"
  }'`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Collections API Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Collections API</CardTitle>
              <CardDescription>Endpoints for processing incoming payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Create Collection Request
                    <Badge variant="secondary">POST /collections</Badge>
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Create a new collection request to receive payment from a customer.
                  </p>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500">Request Body</h4>
                    <pre className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                      {`{
  "amount": 1000,
  "currency": "UGX",
  "reference": "INV001",
  "reason": "Payment for invoice #001",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "256712345678"
  }
}`}
                    </pre>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500">Response</h4>
                    <pre className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                      {`{
  "status": "success",
  "message": "Collection request created",
  "data": {
    "id": "col_123456",
    "amount": 1000,
    "currency": "UGX",
    "reference": "INV001",
    "status": "pending",
    "created_at": "2024-02-17T12:00:00Z"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Get Collection Status
                    <Badge variant="secondary">GET /collections/:id</Badge>
                  </h3>
                  <p className="mt-2 text-gray-600">Check the status of a collection request.</p>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500">Response</h4>
                    <pre className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                      {`{
  "status": "success",
  "data": {
    "id": "col_123456",
    "status": "completed",
    "amount": 1000,
    "currency": "UGX",
    "reference": "INV001",
    "created_at": "2024-02-17T12:00:00Z",
    "completed_at": "2024-02-17T12:05:00Z"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Payouts API Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Payouts API</CardTitle>
              <CardDescription>Endpoints for processing outgoing payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Create Payout
                    <Badge variant="secondary">POST /payouts</Badge>
                  </h3>
                  <p className="mt-2 text-gray-600">Initiate a payout to a recipient&apos;s mobile money account.</p>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500">Request Body</h4>
                    <pre className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                      {`{
  "amount": 1000,
  "currency": "UGX",
  "recipient": {
    "name": "John Doe",
    "phone": "256712345678",
    "provider": "MTN"
  },
  "reference": "PAY001",
  "reason": "Salary payment"
}`}
                    </pre>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500">Response</h4>
                    <pre className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                      {`{
  "status": "success",
  "message": "Payout initiated",
  "data": {
    "id": "pay_123456",
    "amount": 1000,
    "currency": "UGX",
    "status": "pending",
    "reference": "PAY001",
    "created_at": "2024-02-17T12:00:00Z"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Get Payout Status
                    <Badge variant="secondary">GET /payouts/:id</Badge>
                  </h3>
                  <p className="mt-2 text-gray-600">Check the status of a payout.</p>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500">Response</h4>
                    <pre className="mt-2 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                      {`{
  "status": "success",
  "data": {
    "id": "pay_123456",
    "status": "completed",
    "amount": 1000,
    "currency": "UGX",
    "reference": "PAY001",
    "created_at": "2024-02-17T12:00:00Z",
    "completed_at": "2024-02-17T12:05:00Z"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Error Handling Section */}
        <section className="mt-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>Learn about API error codes and how to handle them</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-600">
                  The API uses conventional HTTP response codes to indicate the success or failure of an API request.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Common Error Codes</h3>
                  <div className="grid gap-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">400 Bad Request</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        The request was unacceptable, often due to missing parameters.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">401 Unauthorized</h4>
                      <p className="mt-1 text-sm text-gray-600">No valid API key provided.</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">403 Forbidden</h4>
                      <p className="mt-1 text-sm text-gray-600">The API key doesn&apos;t have permissions.</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">404 Not Found</h4>
                      <p className="mt-1 text-sm text-gray-600">The requested resource doesn&apos;t exist.</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">429 Too Many Requests</h4>
                      <p className="mt-1 text-sm text-gray-600">Too many requests hit the API too quickly.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Error Response Format</h3>
                  <pre className="mt-4 block w-full rounded bg-zinc-950 px-4 py-3 font-mono text-sm text-white overflow-x-auto">
                    {`{
  "status": "error",
  "code": "invalid_request",
  "message": "The request was invalid",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

