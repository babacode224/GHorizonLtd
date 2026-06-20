"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Image } from "lucide-react";
import clsx from "clsx";

interface Props {
  label: string;
  hint?: string;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

const DEFAULT_ACCEPT = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export default function FileDropzone({
  label,
  hint,
  accept = DEFAULT_ACCEPT,
  multiple = true,
  files,
  onChange,
  maxFiles = 10,
}: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const merged = multiple ? [...files, ...accepted].slice(0, maxFiles) : accepted.slice(0, 1);
      onChange(merged);
    },
    [files, multiple, maxFiles, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
  });

  const remove = (idx: number) => onChange(files.filter((_, i) => i !== idx));

  const isImage = (f: File) => f.type.startsWith("image/");

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>

      <div
        {...getRootProps()}
        className={clsx(
          "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-brand bg-brand/10"
            : "border-surface-border hover:border-brand/60 hover:bg-surface-raised/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <Upload
            className={clsx(
              "w-8 h-8 transition-colors duration-200",
              isDragActive ? "text-brand" : "text-slate-500"
            )}
          />
          <p className="text-sm text-slate-300 font-medium">
            {isDragActive ? "Drop files here…" : "Drag & drop files, or click to browse"}
          </p>
          {hint && <p className="text-xs text-slate-500">{hint}</p>}
          <p className="text-xs text-slate-600">PDF, JPG, PNG, WEBP — max 20 MB each</p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2 mt-3">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-3 bg-surface-raised rounded-lg border border-surface-border group"
            >
              {isImage(f) ? (
                <Image className="w-4 h-4 text-brand shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-sm text-slate-300 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-slate-500 shrink-0">
                {(f.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded hover:bg-danger/20 text-slate-500 hover:text-danger transition-colors cursor-pointer"
                aria-label={`Remove ${f.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
