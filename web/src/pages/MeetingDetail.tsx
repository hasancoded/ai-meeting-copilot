import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { meetingsApi, Meeting } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner, LoadingScreen } from "@/components/ui/Spinner";
import { FileDrop } from "@/components/FileDrop";
import { DeleteMeetingModal } from "@/components/DeleteMeetingModal";
import {
  ArrowLeft,
  Upload,
  PlayCircle,
  FileText,
  ListChecks,
  Lightbulb,
  Calendar,
  User,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type TabId = "summary" | "transcript" | "actions" | "decisions";

export const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMeeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMeeting = async () => {
    try {
      setIsLoading(true);
      const data = await meetingsApi.getById(Number(id));
      setMeeting(data);
    } catch {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      await meetingsApi.uploadAudio(Number(id), file, (progress) => {
        setUploadProgress(progress);
      });

      toast.success("Audio uploaded successfully!");
      await loadMeeting();
    } catch {
      // Error handled by interceptor
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleProcess = async () => {
    if (!meeting || !meeting.audioPath) return;

    try {
      setIsProcessing(true);
      const updated = await meetingsApi.process(meeting.id);
      setMeeting(updated);
      toast.success("Meeting processed successfully!");
      setActiveTab("summary");
    } catch {
      // Error handled by interceptor
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!meeting) return;

    try {
      setIsDeleting(true);
      await meetingsApi.delete(meeting.id);
      toast.success("Meeting deleted successfully");
      navigate("/");
    } catch {
      // Error handled by interceptor
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!meeting) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Meeting not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const tabs: Array<{
    id: TabId;
    label: string;
    icon: typeof FileText;
    show: boolean;
  }> = [
    {
      id: "summary",
      label: "Summary",
      icon: FileText,
      show: !!meeting.summary,
    },
    {
      id: "transcript",
      label: "Transcript",
      icon: PlayCircle,
      show: !!meeting.transcript,
    },
    {
      id: "actions",
      label: "Action Items",
      icon: ListChecks,
      show: !!meeting.actionItems?.length,
    },
    {
      id: "decisions",
      label: "Decisions",
      icon: Lightbulb,
      show: !!meeting.decisions?.length,
    },
  ];

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {meeting.title}
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(meeting.createdAt)}</span>
              </div>
              {meeting.summary ? (
                <Badge variant="success">Processed</Badge>
              ) : meeting.audioPath ? (
                <Badge variant="warning">Ready to Process</Badge>
              ) : (
                <Badge variant="default">No Audio</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModal(true)}
              className="text-gray-600 hover:text-error-600 hover:bg-error-50 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Upload Section (if no audio) */}
        {!meeting.audioPath && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Upload Audio File</h2>
              </div>
            </CardHeader>
            <CardBody>
              {isUploading ? (
                <div className="text-center py-8">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <FileDrop onFileSelect={handleFileSelect} />
              )}
            </CardBody>
          </Card>
        )}

        {/* Process Button (if audio uploaded but not processed) */}
        {meeting.audioPath && !meeting.summary && (
          <Card className="mb-6">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Ready to Process
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click the button to transcribe and analyze this meeting
                  </p>
                </div>
                <Button
                  onClick={handleProcess}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  <PlayCircle className="h-5 w-5" />
                  <span>Process Meeting</span>
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tabs (if processed) */}
        {meeting.summary && (
          <>
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8" aria-label="Tabs">
                {tabs
                  .filter((tab) => tab.show)
                  .map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-semibold text-sm transition-all ${
                          activeTab === tab.id
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="animate-slide-up">
              {activeTab === "summary" && (
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Executive Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {meeting.summary}
                    </p>
                  </CardBody>
                </Card>
              )}

              {activeTab === "transcript" && (
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Full Transcript
                    </h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {meeting.transcript}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}

              {activeTab === "actions" && meeting.actionItems && (
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Action Items
                    </h3>
                    <div className="space-y-4">
                      {meeting.actionItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex-shrink-0 w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium leading-relaxed">
                              {item.task}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.owner && (
                                <Badge variant="info">
                                  <User className="h-3 w-3 mr-1" />
                                  {item.owner}
                                </Badge>
                              )}
                              {item.due && (
                                <Badge variant="warning">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {item.due}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {activeTab === "decisions" && meeting.decisions && (
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Key Decisions
                    </h3>
                    <ul className="space-y-3">
                      {meeting.decisions.map((decision, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-700 rounded-full flex items-center justify-center">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-900 flex-1 leading-relaxed">
                            {decision}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Meeting Modal */}
      <DeleteMeetingModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        meetingTitle={meeting?.title || ""}
        isLoading={isDeleting}
      />
    </Layout>
  );
};
