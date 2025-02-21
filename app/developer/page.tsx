"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import Header from "../Header";

export default function DeveloperDocs() {
  const [isLiveEnvironment, setIsLiveEnvironment] = useState(false);

  const baseUrl = isLiveEnvironment ? "https://api.example.com/v1" : "https://api-test.example.com/v1";

  return (
    <div>
      <Header />
      <br />
      <br />
      <br />
      <div className="py-6">
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

          {/* Authentication Section */}
          <section className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>Authenticate users and retrieve API tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Login
                    <Badge variant="secondary">POST /auth/login</Badge>
                  </h3>
                  <p className="text-gray-600">Authenticate users and retrieve a token.</p>

                  <h4 className="font-medium text-sm text-gray-500">Request Body</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "secret_key": "secret_key",
  "api_key": "api_key"
}`}
                  </pre>

                  <h4 className="font-medium text-sm text-gray-500">Response</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "token": "your_api_token"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Transactions API Section */}
          <section className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Transactions API</CardTitle>
                <CardDescription>Manage and process transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Validate Transaction */}
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Validate Transaction
                    <Badge variant="secondary">POST /payment/validate-request</Badge>
                  </h3>
                  <p className="text-gray-600">Initiate a Push or Pull transaction depending on trans_type.</p>

                  <h4 className="font-medium text-sm text-gray-500">Request Body</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "reference_id": "XCVBH7654BV6B9V",
  "amount": 1000,
  "trans_type": "PULL", // Use "PUSH" for push transactions
  "currency": "UGX",
  "product_id": "10000",
  "account_number": "256787719618",
  "public_key": "GBPREREREREOOPOPOOREOPREOREOPROPROEROP"
}`}
                  </pre>

                  <h4 className="font-medium text-sm text-gray-500">Response</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "status": 201,
  "message": "Transaction validated successfully",
  "data": {
    "accountName": "EMMANUEL MBONYE",
    "phoneNumber": "256787719618",
    "fee": 200,
    "reference_id": "XCVBH7654BV6B9V",
    "validation_id": "9e8bd829-8693-4b6f-aac3-467bbfad6f3e",
    "client_id": 10819033,
    "product_id": "10000",
    "trans_type": "PULL",
    "trans_id": "6bd29b24-fad5-46c4-ba4b-4993c3166f6a",
    "amount": 1000,
    "asset_code": "cUGX",
    "currency": "UGX",
    "sender_account": "GBPREREREREOOPOPOOREOPREOREOPROPROEROP",
    "receiver_account": "256787719618",
    "memo": "9e8bd829-8693-4b6f-aac3-467bbfad6f3e",
    "status": "pending"
  }
}`}
                  </pre>
                </div>

                {/* Approve Push */}
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Approve Push Transaction
                    <Badge variant="secondary">POST /payment/approve-push</Badge>
                  </h3>
                  <p className="text-gray-600">Approve a validated Push transaction.</p>

                  <h4 className="font-medium text-sm text-gray-500">Request Body</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "xdr": "1000",
  "trans_id": "84e6bc53-e718-42a8-adb8-6725d0361fba"
}`}
                  </pre>

                  <h4 className="font-medium text-sm text-gray-500">Response</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "status": 200,
  "message": "Push transaction approved",
  "data": {
    "trans_id": "84e6bc53-e718-42a8-adb8-6725d0361fba",
    "status": "completed"
  }
}`}
                  </pre>
                </div>

                {/* Approve Pull */}
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Approve Pull Transaction
                    <Badge variant="secondary">POST /payment/approve-pull</Badge>
                  </h3>
                  <p className="text-gray-600">Approve a validated Pull transaction.</p>

                  <h4 className="font-medium text-sm text-gray-500">Request Body</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "validationId": "9e8bd829-8693-4b6f-aac3-467bbfad6f3e"
}`}
                  </pre>

                  <h4 className="font-medium text-sm text-gray-500">Response</h4>
                  <pre className="bg-zinc-950 text-white rounded p-4 overflow-x-auto text-sm">
                    {`{
  "status": 200,
  "message": "Pull transaction approved",
  "data": {
    "validation_id": "9e8bd829-8693-4b6f-aac3-467bbfad6f3e",
    "status": "completed"
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Status Codes Section */}
          <section className="mt-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Status Codes</CardTitle>
                <CardDescription>Common HTTP status codes used in the API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">200 OK</h4>
                  <p className="text-gray-600">The request was successful.</p>

                  <h4 className="font-medium">201 Created</h4>
                  <p className="text-gray-600">A new resource has been successfully created.</p>

                  <h4 className="font-medium">400 Bad Request</h4>
                  <p className="text-gray-600">The request was invalid or missing parameters.</p>

                  <h4 className="font-medium">401 Unauthorized</h4>
                  <p className="text-gray-600">Authentication failed or missing API token.</p>

                  <h4 className="font-medium">403 Forbidden</h4>
                  <p className="text-gray-600">The authenticated user does not have permission.</p>

                  <h4 className="font-medium">404 Not Found</h4>
                  <p className="text-gray-600">The requested resource does not exist.</p>

                  <h4 className="font-medium">500 Internal Server Error</h4>
                  <p className="text-gray-600">A server error occurred. Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
