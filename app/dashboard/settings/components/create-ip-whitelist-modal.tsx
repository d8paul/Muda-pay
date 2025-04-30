import { TextField } from "@mui/material";

interface CreateIpWhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  newIpAddress: string;
  setNewIpAddress: (ip: string) => void;
}

const CreateIpWhitelistModal: React.FC<CreateIpWhitelistModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  newIpAddress,
  setNewIpAddress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add IP Address to Whitelist</h3>

          <TextField
            fullWidth
            size="small"
            label="IP Address"
            variant="outlined"
            value={newIpAddress}
            onChange={(e) => setNewIpAddress(e.target.value)}
            className="mt-2"
            placeholder="Enter IP address (e.g., 192.168.1.1)"
          />

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-500 text-base font-medium text-white hover:bg-sky-600"
              onClick={onAdd}
            >
              Add
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

export default CreateIpWhitelistModal;