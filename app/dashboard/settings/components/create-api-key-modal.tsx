import { TextField } from "@mui/material";

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  newApiKeyName: string;
  setNewApiKeyName: (name: string) => void;
}

const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  newApiKeyName,
  setNewApiKeyName,
}) => {
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
              onClick={onGenerate}
            >
              Generate
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

export default CreateApiKeyModal;