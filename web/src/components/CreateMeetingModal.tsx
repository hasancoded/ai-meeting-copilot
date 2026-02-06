import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { meetingsApi } from "@/lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { X } from "lucide-react";
import { toast } from "sonner";

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMeetingModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateMeetingModalProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
  });

  const onSubmit = async (data: MeetingFormData) => {
    try {
      setIsLoading(true);
      const meeting = await meetingsApi.create(data.title);
      toast.success("Meeting created successfully!");
      reset();
      onSuccess();
      // Navigate to meeting detail to upload audio
      navigate(`/meetings/${meeting.id}`);
    } catch {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8 pr-8">
            Create New Meeting
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Meeting Title"
              placeholder="e.g., Team Standup - Jan 10"
              error={errors.title?.message}
              {...register("title")}
              autoFocus
            />

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create Meeting
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
