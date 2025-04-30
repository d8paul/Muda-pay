"use client"

import { useState, useEffect } from "react"
import { IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { get, post } from "@/utils/api"
import CreateWebhookModal from "./create-webhook-modal"
import CreateIpWhitelistModal from "./create-ip-whitelist-modal"
import ConfirmDialog from "./confirm-dialog"
import { Card } from "@/components/ui/card"
import { Button as UIButton } from "@/components/ui/button"

export default function IpsWebhookTab() {
  const [webhooks, setWebhooks] = useState([])
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState("")

  const [ipWhitelist, setIpWhitelist] = useState([])
  const [showIpWhitelistModal, setShowIpWhitelistModal] = useState(false)
  const [newIpAddress, setNewIpAddress] = useState("")

  // State for ConfirmDialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string | null, id: string | null }>({ type: null, id: null })

  useEffect(() => {
    fetchWebhooks()
    fetchIpWhitelist()
  }, [])

  // Fetch webhooks
  const fetchWebhooks = async () => {
    try {
      const response = await get("clients/webhooks")
      setWebhooks(response.data)
    } catch (error) {
      console.error("Error fetching webhooks:", error)
    }
  }

  // Fetch IP whitelist
  const fetchIpWhitelist = async () => {
    try {
      const response = await get("clients/ip-whitelist")
      setIpWhitelist(response.data)
    } catch (error) {
      console.error("Error fetching IP whitelist:", error)
    }
  }

  // Add IP to whitelist
  const handleAddIpAddress = async () => {
    if (!newIpAddress.trim()) return

    try {
      await post("clients/add-ip-whitelist", { ip_address: newIpAddress })
      setNewIpAddress("")
      setShowIpWhitelistModal(false)
      fetchIpWhitelist()
    } catch (error) {
      console.error("Error adding IP address:", error)
    }
  }

  // Delete IP from whitelist
  const handleDeleteIpAddress = async (ipId: string) => {
    try {
      await post("clients/delete-ip-whitelist", { id: ipId })
      fetchIpWhitelist()
    } catch (error) {
      console.error("Error deleting IP address:", error)
    }
  }

  // Add new webhook
  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) return

    try {
      await post("clients/addWebhook", { callback_url: newWebhookUrl })
      setNewWebhookUrl("")
      setShowWebhookModal(false)
      fetchWebhooks()
    } catch (error) {
      console.error("Error adding webhook:", error)
    }
  }

  // Delete webhook
  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await post("clients/delete-webhook", { id: webhookId })
      fetchWebhooks()
    } catch (error) {
      console.error("Error deleting webhook:", error)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirmation = (type: string, id: string) => {
    setItemToDelete({ type, id })
    setConfirmDialogOpen(true)
  }

  // Handle confirm action
  const handleConfirm = () => {
    if (itemToDelete.type === "webhook" && itemToDelete.id) {
      handleDeleteWebhook(itemToDelete.id)
    } else if (itemToDelete.type === "ipAddress" && itemToDelete.id) {
      handleDeleteIpAddress(itemToDelete.id)
    }
    setConfirmDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Webhooks Section */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Webhooks</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure webhooks to receive real-time notifications for events in your account.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <UIButton
              onClick={() => setShowWebhookModal(true)}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Add New Webhook
            </UIButton>
          </div>

          {webhooks.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-500">No webhooks configured. Add a webhook to receive notifications.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhooks.map((webhook: any) => (
                    <tr key={webhook.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {webhook.callback_url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <IconButton
                          onClick={() => handleDeleteConfirmation("webhook", webhook.id)}
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

      {/* IP Whitelist Section */}
      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">IP Whitelist</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage IP addresses that are allowed to access your API.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <UIButton
              onClick={() => setShowIpWhitelistModal(true)}
              className="bg-sky-500 hover:bg-sky-600"
            >
              Add IP Address
            </UIButton>
          </div>

          {ipWhitelist.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-500">No IP addresses whitelisted. Add an IP address to give API access.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ipWhitelist.map((ip: any) => (
                    <tr key={ip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {ip.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ip.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <IconButton
                          onClick={() => handleDeleteConfirmation("ipAddress", ip.id)}
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

      {/* IP Whitelist Modal */}
      {showIpWhitelistModal && (
        <CreateIpWhitelistModal
          isOpen={showIpWhitelistModal}
          onClose={() => setShowIpWhitelistModal(false)}
          onAdd={handleAddIpAddress}
          newIpAddress={newIpAddress}
          setNewIpAddress={setNewIpAddress}
        />
      )}

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
    </div>
  )
}