import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
}

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Check if image is too small
        if (img.width < 200 || img.height < 200) {
          setError('Image is too small. Please use an image at least 200x200 pixels.');
          resolve(false);
        }
        // Check if image is too large
        else if (file.size > 4 * 1024 * 1024) {
          setError('Image is too large. Please use an image under 4MB.');
          resolve(false);
        }
        else {
          setError(null);
          resolve(true);
        }
      };
      img.onerror = () => {
        setError('Failed to load image. Please try a different image.');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setError('Please select a valid image file (JPEG, PNG).');
      return;
    }

    setIsLoading(true);
    setError(null);
    const file = acceptedFiles[0];
    
    try {
      // Validate image
      const isValid = await validateImage(file);
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onImageSelect(base64);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to process image. Please try again.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
      setIsLoading(false);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        
        {isLoading ? (
          <div className="text-gray-500">
            Processing image...
          </div>
        ) : preview ? (
          <div className="relative aspect-video w-full max-w-lg mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-500">
              {isDragActive ? (
                "Drop your image here..."
              ) : (
                <>
                  Drag & drop an image here, or click to select
                  <br />
                  <span className="text-sm text-gray-400">
                    (JPEG or PNG, max 4MB)
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
    </div>
  );
} 