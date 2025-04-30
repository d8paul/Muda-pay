"use client"

import { useState, useEffect } from "react"
import { IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { get, post } from "@/utils/api"
import CreateApiKeyModal from "./create-api-key-modal"
import { CopyToClipboard } from "react-copy-to-clipboard"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material"
import { Card } from "@/components/ui/card"
import { Button as UIButton } from "@/components/ui/button"

interface ApiKey {
  id: number;
  key_name: string | null;
  client_id: number;
  api_key: string;
  secret_key: string;
  created_at: string;
}

export default function ApiKeysTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [selectedSecretKey, setSelectedSecretKey] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await get("clients/getapikeys");
      setApiKeys(response);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newApiKeyName.trim()) return;
    try {
      const response = await post("clients/generate-api-key", { name: newApiKeyName });
      setNewApiKeyName("");
      setShowApiKeyModal(false);
      fetchApiKeys();
      setSelectedSecretKey(response.data.secret_key);
      setShowSecretKey(true);
    } catch (error) {
      console.error("Error generating API key:", error);
    }
  };

  const handleDeleteApiKey = async (apiKeyId: any) => {
    try {
      await post("clients/delete-api-key", { id: apiKeyId });
      fetchApiKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  };

  const handleCloseSecretKey = () => {
    setShowSecretKey(false);
    setCopySuccess(false);
    setSelectedSecretKey("");
  };

  const testKeys = apiKeys.filter((key) => key?.api_key?.startsWith("test_"));
  const liveKeys = apiKeys.filter((key) => !key.api_key.startsWith("test_"));

  return (
    <div className="space-y-8">
      {/* Test API Keys Section */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Test API Keys</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your test API keys for development purposes.</p>
        </div>
        <div className="p-4 sm:p-6">
          {testKeys.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-500">No test API keys found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Key
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {apiKey.key_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        <div className="flex items-center">
                          <span className="mr-2">API-KEY: {apiKey.api_key}</span>
                          <CopyToClipboard text={apiKey.api_key} onCopy={() => {}}>
                            <IconButton size="small">
                              <ContentCopyIcon fontSize="small" className="text-sky-500" />
                            </IconButton>
                          </CopyToClipboard>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <IconButton
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          aria-label="delete"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" className="text-red-500 hover:text-red-700" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Live API Keys Section */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Live API Keys</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Generate and manage live API keys for your application integrations.</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <UIButton
              onClick={() => setShowApiKeyModal(true)}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Generate New API Key
            </UIButton>
          </div>

          {liveKeys.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-500">No live API keys found. Generate your first API key to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Key
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liveKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {apiKey.key_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        <div className="flex items-center">
                          <span className="mr-2">API-KEY: {apiKey.api_key}</span>
                          <CopyToClipboard text={apiKey.api_key} onCopy={() => {}}>
                            <IconButton size="small">
                              <ContentCopyIcon fontSize="small" className="text-sky-500" />
                            </IconButton>
                          </CopyToClipboard>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <IconButton
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          aria-label="delete"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" className="text-red-500 hover:text-red-700" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

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

      {/* Secret Key Dialog */}
      <Dialog open={showSecretKey} onClose={handleCloseSecretKey}>
        <DialogTitle className="text-center">
          Secret Key
          <CopyToClipboard text={selectedSecretKey} onCopy={() => setCopySuccess(true)}>
            <IconButton aria-label="copy" className="ml-2">
              <ContentCopyIcon className="text-sky-500 hover:text-sky-700" />
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