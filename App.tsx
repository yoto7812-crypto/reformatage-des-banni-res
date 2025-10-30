
import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { resizeImage } from './services/imageService';
import FileUpload from './components/FileUpload';
import ImageCard from './components/ImageCard';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [resizedImage, setResizedImage] = useState<ImageFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setOriginalImage(null);
    setResizedImage(null);

    try {
      const originalUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = originalUrl;

      img.onload = async () => {
        const aspectRatio = img.width / img.height;
        // Allow for a small tolerance in aspect ratio
        if (Math.abs(aspectRatio - 16 / 9) > 0.01) {
          setError('Image aspect ratio must be 16:9.');
          setIsLoading(false);
          URL.revokeObjectURL(originalUrl);
          return;
        }

        setOriginalImage({
          url: originalUrl,
          name: file.name,
          width: img.width,
          height: img.height,
          size: file.size,
        });

        try {
          const resized = await resizeImage(file);
          setResizedImage(resized);
        } catch (processError) {
          setError(processError instanceof Error ? processError.message : 'Failed to process image.');
        } finally {
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        setError('Could not load the selected image.');
        setIsLoading(false);
        URL.revokeObjectURL(originalUrl);
      };

    } catch (e) {
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  }, []);

  const resetState = () => {
    if (originalImage) URL.revokeObjectURL(originalImage.url);
    if (resizedImage) URL.revokeObjectURL(resizedImage.url);
    setOriginalImage(null);
    setResizedImage(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Proportional Image Resizer
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Upload a 16:9 image to resize it to > 2880x2304 and under 5MB.
          </p>
        </header>

        <main className="w-full">
          {!originalImage && !isLoading && (
            <FileUpload onFileSelect={handleFileSelect} />
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-center my-4">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400"></div>
                <p className="mt-4 text-gray-300">Processing your image...</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {originalImage && (
              <ImageCard title="Original Image" imageFile={originalImage} />
            )}
            {resizedImage && (
              <ImageCard title="Resized Image" imageFile={resizedImage} isDownloadable={true} />
            )}
          </div>
          
          {(originalImage || isLoading) && (
            <div className="text-center mt-8">
              <button
                onClick={resetState}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                Start Over
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
