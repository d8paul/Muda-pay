"use client";

import { useState, useEffect } from "react";
import { Switch as MUISwitch, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // Import delete icon
import { get, post } from "@/utils/api";

// ConfirmDialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose} // Close modal when clicking outside
        />

        {/* Spacer to center the modal contents */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Action</h3>
          <p className="mt-2 text-sm text-gray-500">{message}</p>

          {/* Action Buttons */}
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700"
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const [webhooks, setWebhooks] = useState([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // State for ConfirmDialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ type: null, id: null });

  useEffect(() => {
    fetchApiKeys();
    fetchWebhooks();
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

  // Fetch webhooks
  const fetchWebhooks = async () => {
    try {
      const response = await get("clients/webhooks");
      setWebhooks(response.data);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    }
  };

  // Generate new API key
  const handleGenerateApiKey = async () => {
    if (!newApiKeyName.trim()) return;

    try {
      await post("clients/generate-api-key", { name: newApiKeyName });
      setNewApiKeyName("");
      setShowApiKeyModal(false);
      fetchApiKeys();
    } catch (error) {
      console.error("Error generating API key:", error);
    }
  };

  // Delete API key
  const handleDeleteApiKey = async (apiKeyId: string) => {
    try {
      await post("clients/delete-api-key", { id: apiKeyId });
      fetchApiKeys(); // Refresh the list
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  };

  // Add new webhook
  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) return;

    try {
      await post("clients/addWebhook", { callback_url: newWebhookUrl });
      setNewWebhookUrl("");
      setShowWebhookModal(false);
      fetchWebhooks();
    } catch (error) {
      console.error("Error adding webhook:", error);
    }
  };

  // Delete webhook
  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await post("clients/delete-webhook", { id: webhookId });
      fetchWebhooks(); // Refresh the list
    } catch (error) {
      console.error("Error deleting webhook:", error);
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

  // Handle delete confirmation
  const handleDeleteConfirmation = (type, id) => {
    setItemToDelete({ type, id });
    setConfirmDialogOpen(true);
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (itemToDelete.type === "apiKey") {
      handleDeleteApiKey(itemToDelete.id);
    } else if (itemToDelete.type === "webhook") {
      handleDeleteWebhook(itemToDelete.id);
    }
    setConfirmDialogOpen(false);
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((apiKey: any) => (
                    <tr key={apiKey.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {apiKey.key_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {apiKey.api_key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <IconButton
                          onClick={() => handleDeleteConfirmation("apiKey", apiKey.id)}
                          aria-label="delete"
                        >
                          <DeleteIcon className="text-red-500 hover:text-red-700" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------- */}
        {/* 2) Webhooks Section */}
        {/* ----------------------------------------------- */}
        <div className="py-4 bg-white shadow sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Webhooks</h3>
            <p className="mt-2 text-sm text-gray-500">Manage your webhooks here.</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowWebhookModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add New Webhook
              </button>
            </div>

            {/* Table of Webhooks */}
            <div className="mt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Callback URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhooks.map((webhook: any) => (
                    <tr key={webhook.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {webhook.callback_url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <IconButton
                          onClick={() => handleDeleteConfirmation("webhook", webhook.id)}
                          aria-label="delete"
                        >
                          <DeleteIcon className="text-red-500 hover:text-red-700" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirm}
        message="Are you sure you want to delete this item? This action cannot be undone."
      />

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowApiKeyModal(false)} // Close modal when clicking outside
            />

            {/* Spacer to center the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Generate New API Key</h3>

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

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowWebhookModal(false)} // Close modal when clicking outside
            />

            {/* Spacer to center the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Webhook</h3>

              {/* MUI TextField for the Webhook URL */}
              <TextField
                fullWidth
                size="small"
                label="Callback URL"
                variant="outlined"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                className="mt-2"
              />

              {/* Action Buttons */}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
                  onClick={handleAddWebhook}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0"
                  onClick={() => setShowWebhookModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowResetPasswordModal(false)} // Close modal when clicking outside
            />

            {/* Spacer to center the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Reset Password</h3>

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