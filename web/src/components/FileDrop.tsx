import { useCallback, useMemo } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Upload, FileAudio } from "lucide-react";

interface FileDropProps {
  onFileSelect: (file: File) => void;
  accept?: Accept;
  maxSize?: number;
}

export const FileDrop = ({
  onFileSelect,
  accept,
  maxSize = 100 * 1024 * 1024, // 100MB
}: FileDropProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  // Default accept configuration if none is provided
  const acceptedTypes = useMemo<Accept>(
    () =>
      accept || {
        "audio/*": [".mp3", ".wav", ".m4a"],
        "video/*": [".mp4", ".webm", ".mpeg"],
      },
    [accept]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedTypes,
      maxSize,
      multiple: false,
    });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          {isDragActive ? (
            <FileAudio className="h-12 w-12 text-primary-500 mb-4" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
          )}
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive
              ? "Drop your file here"
              : "Drop audio/video file here"}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse (MP3, WAV, M4A, MP4, WebM - max 100MB)
          </p>
        </div>
      </div>
      {fileRejections.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {fileRejections[0].errors[0].message}
        </div>
      )}
    </div>
  );
};
