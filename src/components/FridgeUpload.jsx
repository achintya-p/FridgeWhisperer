import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeImage } from '../lib/geminiClient';

const FridgeUpload = ({ onAnalysisComplete }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processImage = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert the file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        
        // Call Gemini API to analyze the image
        const analysis = await analyzeImage(base64Image);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }
        
        setLoading(false);
      };
      
      reader.onerror = () => {
        setError('Failed to read the image file');
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(URL.createObjectURL(file));
    processImage(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Fridge Photo</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p>Analyzing your fridge contents...</p>
          </div>
        ) : image ? (
          <div>
            <img src={image} alt="Uploaded fridge" className="max-w-md mx-auto mb-4" />
            <p className="text-sm text-gray-500">Drop a new image to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-2">
              {isDragActive ? 'Drop your fridge photo here' : 'Drag & drop your fridge photo here'}
            </p>
            <p className="text-sm text-gray-500">or click to select a file</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default FridgeUpload; 