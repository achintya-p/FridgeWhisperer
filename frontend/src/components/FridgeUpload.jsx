import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FridgeUpload = ({ onUpload, isLoading }) => {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Send to parent
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isLoading} />
        
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Fridge preview"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-500">
              Click or drag to upload a different photo
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl text-gray-300">
              📸
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                Upload a photo of your fridge
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
      </div>
      
      <p className="mt-4 text-sm text-center text-gray-500">
        Supported formats: JPEG, PNG
      </p>
    </div>
  );
};

export default FridgeUpload; 