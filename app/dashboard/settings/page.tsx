"use client";

import { useState, useEffect } from "react";
import { IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { get, post } from "@/utils/api";
import ResetPasswordModal from "./components/reset-password-modal";
import ConfirmDialog from "./components/confirm-dialog";
import CreateWebhookModal from "./components/create-webhook-modal";
import CreateApiKeyModal from "./components/create-api-key-modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [selectedSecretKey, setSelectedSecretKey] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

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
      const response = await post("clients/generate-api-key", { name: newApiKeyName });
      console.log("Response Data", response);
      setNewApiKeyName("");
      setShowApiKeyModal(false);
      fetchApiKeys();
      setSelectedSecretKey(response.data.secret_key);
      setShowSecretKey(true);
    } catch (error) {
      console.error("Error generating API key:", error);
    }
  };

  // Delete API key
  const handleDeleteApiKey = async (apiKeyId: string) => {
    try {
      await post("clients/delete-api-key", { id: apiKeyId });
      fetchApiKeys(); // Refresh list
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

  const handleViewSecretKey = (secretKey: any) => {
    setSelectedSecretKey(secretKey);
    setShowSecretKey(true);
  };

  const handleCloseSecretKey = () => {
    setShowSecretKey(false);
    setCopySuccess(false);
    setSelectedSecretKey("");
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
  const handleDeleteConfirmation = (type: any, id: any) => {
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
                        API-KEY: {apiKey.api_key}
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
                      URL
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
            <p className="mt-2 text-sm text-gray-500">Reset your account password here.</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowResetPasswordModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Reset Password
              </button>
            </div>
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

      {/* Webhook Modal */}
      {showWebhookModal && (
        <CreateWebhookModal
          isOpen={showWebhookModal}
          onClose={() => setShowWebhookModal(false)}
          onAdd={handleAddWebhook}
          newWebhookUrl={newWebhookUrl}
          setNewWebhookUrl={setNewWebhookUrl}
        />
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <CreateApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onGenerate={handleGenerateApiKey}
          newApiKeyName={newApiKeyName}
          setNewApiKeyName={setNewApiKeyName}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <ResetPasswordModal
          showResetPasswordModal={showResetPasswordModal}
          setShowResetPasswordModal={setShowResetPasswordModal}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          resetPassword={resetPassword}
          setResetPassword={setResetPassword}
          handleResetPassword={handleResetPassword}
        />
      )}

      {/* Secret Key Dialog */}
      <Dialog open={showSecretKey} onClose={handleCloseSecretKey}>
        <DialogTitle className="text-center">
          Secret Key
          <CopyToClipboard text={selectedSecretKey} onCopy={() => setCopySuccess(true)}>
            <IconButton aria-label="copy" className="ml-2">
              <ContentCopyIcon className="text-blue-500 hover:text-blue-700" />
            </IconButton>
          </CopyToClipboard>
        </DialogTitle>
        <DialogContent className="ml-2 mr-2">
          <DialogContentText>
            {selectedSecretKey}
          </DialogContentText>
          {copySuccess && (
            <div className="mt-2 text-green-500 text-center text-sm">Copied to clipboard!</div>
          )}
          <div className="mt-7 text-red-500 text-center text-sm">The secret key will not be displayed again.</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSecretKey} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}