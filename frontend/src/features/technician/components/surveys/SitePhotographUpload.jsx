import React, { useState } from 'react';
import Card, { CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/common/Button';
import { Camera, Upload, Trash2, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react';
import { PHOTO_CATEGORIES } from '../../utils/technicianConstants';

export const SitePhotographUpload = ({ photos = [], onUploadPhoto, isUploading }) => {
  const [selectedCategory, setSelectedCategory] = useState(PHOTO_CATEGORIES[0].id);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!caption) {
        const catObj = PHOTO_CATEGORIES.find((c) => c.id === selectedCategory);
        setCaption(catObj ? catObj.label : file.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (onUploadPhoto) {
      await onUploadPhoto(selectedFile, caption);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
  };

  return (
    <Card padding={false} className="overflow-hidden mb-6">
      <CardHeader
        title="Site Photographs & Technical Evidence"
        subtitle="Capture photographic proof of rooftop layout, electrical boards, and earthing pits"
        icon={Camera}
      />

      <div className="p-5 space-y-6">
        {/* Upload Action Area */}
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Photograph Evidence Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              >
                {PHOTO_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Caption / Observation Remarks
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Parapet height 3.5ft on southern edge"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
          </div>

          {/* File Picker or Camera Capture */}
          {!previewUrl ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-sm transition">
                <Camera className="w-4 h-4" />
                <span>Capture with Camera / Select Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">Supports JPG, PNG, WEBP up to 10MB</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-24 h-24 object-cover rounded-lg border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-800 truncate">{selectedFile?.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Ready to upload for: {caption}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  size="xs"
                  variant="primary"
                  icon={Upload}
                  onClick={handleUpload}
                  isLoading={isUploading}
                >
                  Upload Evidence
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Uploaded Photos Gallery */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
            <span>Uploaded Site Photographs ({photos.length})</span>
            {photos.length < 2 && (
              <span className="text-[11px] text-amber-600 font-normal">
                Min 2 required before submission
              </span>
            )}
          </h4>

          {photos.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No site photographs uploaded yet. Please capture at least 2 roof and electrical board photos.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-sm transition"
                >
                  <div className="h-28 bg-slate-200 flex items-center justify-center overflow-hidden">
                    {photo.file_path || photo.file_name?.startsWith('http') ? (
                      <img
                        src={photo.file_path || photo.file_name}
                        alt={photo.caption || 'Site photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px] text-center font-mono truncate max-w-[120px]">
                          {photo.file_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <span className="text-[11px] font-semibold text-slate-800 block truncate" title={photo.caption}>
                      {photo.caption || 'Site observation'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {photo.file_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SitePhotographUpload;

