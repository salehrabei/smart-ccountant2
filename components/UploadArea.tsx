import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect, disabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed border-gray-300' : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
      }`}
    >
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
          <UploadCloud size={40} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">اضغط لرفع الفاتورة</p>
          <p className="text-sm text-gray-500 mt-1">أو اسحب الملف هنا (PDF, JPG, PNG)</p>
        </div>
      </div>
    </div>
  );
};