import Link from "next/link";
import { Upload, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Upload as UploadType, FileUpload } from "@/types";

const STATUS_ICON = {
  approved: <CheckCircle className="w-3.5 h-3.5 text-green-600" />,
  rejected: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-600" />,
};

export default function RecentUploadsList({
  textUploads,
  fileUploads,
}: {
  textUploads: UploadType[];
  fileUploads: FileUpload[];
}) {
  if (textUploads.length === 0 && fileUploads.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand-600" />
          Recent Uploads
        </h2>
        <Link href="/my-uploads" className="text-xs text-brand-600 font-medium hover:text-brand-700">
          View All →
        </Link>
      </div>
      <div className="space-y-2">
        {textUploads.map((upload) => (
          <div key={`t-${upload.id}`} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{upload.title}</p>
              <p className="text-xs text-slate-400">{upload.type.replace("_", " ")}</p>
            </div>
            {STATUS_ICON[(upload.status || "pending") as keyof typeof STATUS_ICON]}
          </div>
        ))}
        {fileUploads.map((file) => (
          <div key={`f-${file.id}`} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{file.title || file.fileName}</p>
              <p className="text-xs text-slate-400">{file.fileType} file</p>
            </div>
            {STATUS_ICON[(file.status || "pending") as keyof typeof STATUS_ICON]}
          </div>
        ))}
      </div>
    </div>
  );
}
