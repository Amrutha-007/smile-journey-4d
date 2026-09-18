import React, { useState, useRef } from "react";
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { SAMPLE_PATIENT_IMAGES } from "../../services/sampleImages";

interface PhotoUploaderProps {
  value?: string;
  onChange: (photoUrl: string) => void;
  title?: string;
  description?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  value,
  onChange,
  title = "Upload Patient Smile Photograph",
  description = "Upload a clear photograph of the patient's smile to create potential treatment-stage visualizations.",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, JPEG, PNG, or WEBP).");
      return;
    }

    // Simulate upload progress
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 80);

    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setUploadProgress(null);
          if (e.target?.result) {
            onChange(e.target.result as string);
          }
        }, 200);
      }, 350);
    };
    reader.onerror = () => {
      clearInterval(interval);
      setUploadProgress(null);
      setError("Error reading image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <h4 className="text-base font-bold text-slate-900 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>

      {value ? (
        /* Uploaded Preview State */
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 p-4 relative overflow-hidden transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-48 h-36 rounded-xl overflow-hidden bg-slate-900 shadow-md shrink-0 border border-slate-700">
              <img
                src={value}
                alt="Patient Smile"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Baseline</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 font-semibold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Patient photo uploaded</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Ready to create smile simulation. The facial architecture and smile line have been analyzed.
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Replace Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and drop upload zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-sky-500 bg-sky-50/50 scale-[1.01]"
              : "border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/60"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-slate-800 mb-1">
            Click to upload or drag and drop smile photo
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Supports high-resolution JPG, PNG, WEBP (up to 20MB)
          </p>

          {/* Quick preset selector for fast demo convenience */}
          <div
            className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-slate-500 font-medium pl-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-500" />
              Demo Samples:
            </span>
            <button
              type="button"
              onClick={() => onChange(SAMPLE_PATIENT_IMAGES.ananya.original)}
              className="px-2 py-1 rounded-md bg-white hover:bg-sky-50 hover:text-sky-600 text-slate-700 font-semibold shadow-2xs transition-colors"
            >
              Ananya (Aligners)
            </button>
            <button
              type="button"
              onClick={() => onChange(SAMPLE_PATIENT_IMAGES.rahul.original)}
              className="px-2 py-1 rounded-md bg-white hover:bg-sky-50 hover:text-sky-600 text-slate-700 font-semibold shadow-2xs transition-colors"
            >
              Rahul (Veneers)
            </button>
            <button
              type="button"
              onClick={() => onChange(SAMPLE_PATIENT_IMAGES.meera.original)}
              className="px-2 py-1 rounded-md bg-white hover:bg-sky-50 hover:text-sky-600 text-slate-700 font-semibold shadow-2xs transition-colors"
            >
              Meera (Braces)
            </button>
          </div>

          {uploadProgress !== null && (
            <div className="mt-4 max-w-xs mx-auto">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Uploading: {uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-semibold mt-2">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};
