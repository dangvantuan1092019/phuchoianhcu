
import React, { useState, useCallback, useRef } from 'react';
import { ImageIcon } from './icons/ImageIcon';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageUpload({ file, base64: base64String });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      className={`relative w-full aspect-video border-2 border-dashed rounded-lg transition-colors duration-300 ${dragActive ? 'border-amber-400 bg-gray-700' : 'border-gray-600 bg-gray-900/50'}`}
    >
      <div className="absolute inset-0 p-2">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
             <ImageIcon />
            <p className="mt-2">Kéo và thả ảnh vào đây</p>
            <p className="text-sm text-gray-500">hoặc</p>
            <button
              onClick={onButtonClick}
              className="mt-2 px-4 py-1 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition-colors"
            >
              Chọn từ thiết bị
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />

      {dragActive && (
        <div
          className="absolute inset-0 w-full h-full"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        ></div>
      )}
    </div>
  );
};
