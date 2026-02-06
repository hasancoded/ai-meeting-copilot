import { Button } from "./ui/Button";
import { X, AlertTriangle } from "lucide-react";

interface DeleteMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  meetingTitle: string;
  isLoading?: boolean;
}

export const DeleteMeetingModal = ({
  isOpen,
  onClose,
  onConfirm,
  meetingTitle,
  isLoading = false,
}: DeleteMeetingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Warning Icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-error-100 rounded-2xl mb-6">
            <AlertTriangle className="h-8 w-8 text-error-600" />
          </div>

          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3 pr-8">
            Delete Meeting?
          </h2>

          {/* Content */}
          <div className="mb-8">
            <p className="text-gray-600 mb-4 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{meetingTitle}"
              </span>
              ?
            </p>
            <p className="text-sm text-error-600 font-medium">
              This action cannot be undone. All associated data including audio
              files, transcripts, and analysis will be permanently deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="flex-1 bg-error-600 hover:bg-error-700 focus-visible:ring-error-500"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Delete Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
