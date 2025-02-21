"use client";

import { useState, useEffect } from "react";
// Replace your Headless UI import with MUI
import { Switch as MUISwitch, TextField } from "@mui/material";

import { get, post } from "@/utils/api";

export default function SettingsPage() {
  const [enabledCurrencies, setEnabledCurrencies] = useState({});
  const [kycStatus, setKycStatus] = useState("Verified");

  const [apiKeys, setApiKeys] = useState([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    fetchApiKeys();
    fetchCurrencies();
  }, []);

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      const response = await get("clients/getapikeys");
      setApiKeys(response);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  // Fetch enabled currencies
  const fetchCurrencies = async () => {
    try {
      const response = await get("clients/currencies");
      setEnabledCurrencies(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  // Generate new API key
  const handleGenerateApiKey = async () => {
    if (!newApiKeyName.trim()) return;

    try {
      await post("clients/generate-api-key", { name: newApiKeyName });
      setNewApiKeyName("");
      setShowApiKeyModal(false);
      // Refresh the API keys list
      fetchApiKeys();
    } catch (error) {
      console.error("Error generating API key:", error);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!resetEmail.trim() || !resetPassword.trim()) return;

    try {
      await post("account/reset-password", {
        email: resetEmail,
        password: resetPassword,
      });
      setResetEmail("");
      setResetPassword("");
      setShowResetPasswordModal(false);
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* ----------------------------------------------- */}
        {/* 1) API Keys Section */}
        {/* ----------------------------------------------- */}
        <div className="py-4 bg-white shadow sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">API Keys</h3>
            <p className="mt-2 text-sm text-gray-500">Generate and manage your API keys here.</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Generate New API Key
              </button>
            </div>

            {/* Table of API Keys */}
            <div className="mt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Key
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((apiKey: any) => (
                    <tr key={apiKey.key_name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {apiKey.api_key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {apiKey.public_key}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------- */}
        {/* 2) Currencies Section */}
        {/* ----------------------------------------------- */}
        <div className="py-4 bg-white shadow sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Currencies</h3>
            <p className="mt-2 text-sm text-gray-500">Manage enabled currencies for your account.</p>

            {/* Using MUI Switch, but still wrapped in Tailwind structure */}
            {Object.keys(enabledCurrencies).map((currency: any) => (
              <div key={currency} className="flex items-center mt-4">
                <span className="mr-4 text-sm font-medium text-gray-900">{currency.currency}</span>
                <MUISwitch
                  checked={currency[currency]}
                  onChange={(e) =>
                    setEnabledCurrencies({
                      ...enabledCurrencies,
                      [currency]: e.target.checked,
                    })
                  }
                  color="primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------- */}
        {/* 3) Reset Password Section */}
        {/* ----------------------------------------------- */}
        <div className="py-4 bg-white shadow sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Reset Password</h3>
            <p className="mt-2 text-sm text-gray-500">Reset your account password.</p>
            <button
              type="button"
              onClick={() => setShowResetPasswordModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------- */}
      {/* 4) Generate API Key Modal (Tailwind-based) */}
      {/* ----------------------------------------------- */}
      {showApiKeyModal && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />

            {/* Spacer to center the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Generate New API Key
              </h3>

              {/* MUI TextField for the API Key Name */}
              <TextField
                fullWidth
                size="small"
                label="API Key Name"
                variant="outlined"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                className="mt-2"
              />

              {/* Action Buttons */}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
                  onClick={handleGenerateApiKey}
                >
                  Generate
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0"
                  onClick={() => setShowApiKeyModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------- */}
      {/* 5) Reset Password Modal (Tailwind-based) */}
      {/* ----------------------------------------------- */}
      {showResetPasswordModal && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
            {/* Spacer to center the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Reset Password
              </h3>

              {/* MUI TextFields for Email and New Password */}
              <TextField
                fullWidth
                size="small"
                label="Email"
                variant="outlined"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-2"
              />

              <TextField
                fullWidth
                size="small"
                label="New Password"
                variant="outlined"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="mt-2"
              />

              {/* Action Buttons */}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
                  onClick={handleResetPassword}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0"
                  onClick={() => setShowResetPasswordModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
