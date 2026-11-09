import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Link2, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.ts';

interface ImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onImageChange,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(35);

      const res = await api.uploadImage(file);
      setUploadProgress(100);

      if (res.success && res.data?.url) {
        onImageChange(res.data.url);
      } else {
        throw new Error(res.message || 'Image upload failed.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to upload image via server. You can also paste an image URL directly.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const isCloudinaryUrl = imageUrl?.includes('res.cloudinary.com');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Product Image
        </label>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setErrorMessage(null);
            }}
            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'url'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>URL Link</span>
          </button>
        </div>
      </div>

      {/* Preview Section if Image exists */}
      {imageUrl ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100?text=Invalid';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">
                {isCloudinaryUrl ? 'Cloudinary Hosted Image' : 'Linked Image'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{imageUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => onImageChange('')}
            disabled={disabled}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : activeTab === 'upload' ? (
        /* Cloudinary Drag & Drop Zone */
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => {
              if (!disabled && !uploading) {
                fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300'
            } ${disabled || uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileInputChange}
              disabled={disabled || uploading}
            />

            {uploading ? (
              <div className="flex flex-col items-center justify-center py-2">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                <p className="text-xs font-semibold text-slate-700">Uploading via server to Cloudinary...</p>
                <div className="w-40 bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-sm">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  <span className="text-blue-600 underline underline-offset-2">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, WEBP up to 5MB (Streamed to Cloudinary)
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Manual URL Input Tab */
        <div className="relative">
          <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            disabled={disabled}
            placeholder="https://images.unsplash.com/... or https://..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 leading-snug">{errorMessage}</div>
        </div>
      )}
    </div>
  );
};

