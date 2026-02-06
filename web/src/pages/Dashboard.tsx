import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { meetingsApi, Meeting } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { DeleteMeetingModal } from "@/components/DeleteMeetingModal";
import { Plus, Calendar, FileText, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    meeting: Meeting | null;
  }>({ isOpen: false, meeting: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      const data = await meetingsApi.getAll();
      setMeetings(data);
    } catch {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.meeting) return;

    try {
      setIsDeleting(true);
      await meetingsApi.delete(deleteModal.meeting.id);
      toast.success("Meeting deleted successfully");
      setDeleteModal({ isOpen: false, meeting: null });
      // Refresh the meetings list
      await loadMeetings();
    } catch {
      // Error handled by interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setDeleteModal({ isOpen: true, meeting });
  };

  const handleMeetingCreated = () => {
    setIsModalOpen(false);
    loadMeetings();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (meeting: Meeting) => {
    if (meeting.summary) {
      return <Badge variant="success">Processed</Badge>;
    } else if (meeting.audioPath) {
      return <Badge variant="warning">Ready to Process</Badge>;
    } else {
      return <Badge variant="default">No Audio</Badge>;
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Meetings
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and review your meeting transcripts
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 sm:flex-shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span>New Meeting</span>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && meetings.length === 0 && (
          <Card>
            <CardBody>
              <EmptyState
                icon={FolderOpen}
                title="No meetings yet"
                description="Create your first meeting to start transcribing and analyzing audio recordings"
                actionLabel="Create Meeting"
                onAction={() => setIsModalOpen(true)}
              />
            </CardBody>
          </Card>
        )}

        {/* Meetings Grid */}
        {!isLoading && meetings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <Card
                key={meeting.id}
                hover
                onClick={() => navigate(`/meetings/${meeting.id}`)}
                className="animate-slide-up h-full"
              >
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-3">
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(meeting)}
                      <button
                        onClick={(e) => openDeleteModal(meeting, e)}
                        className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Delete meeting"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(meeting.createdAt)}</span>
                  </div>

                  {meeting.summary && (
                    <div className="flex items-start text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{meeting.summary}</p>
                    </div>
                  )}

                  {!meeting.summary && meeting.audioPath && (
                    <p className="text-sm text-gray-500 italic">
                      Audio uploaded. Ready to process.
                    </p>
                  )}

                  {!meeting.summary && !meeting.audioPath && (
                    <p className="text-sm text-gray-500 italic">
                      No audio file uploaded yet.
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMeetingCreated}
      />

      {/* Delete Meeting Modal */}
      <DeleteMeetingModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, meeting: null })}
        onConfirm={handleDelete}
        meetingTitle={deleteModal.meeting?.title || ""}
        isLoading={isDeleting}
      />
    </Layout>
  );
};
