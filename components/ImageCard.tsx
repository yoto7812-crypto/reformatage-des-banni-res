
import React from 'react';
import { ImageFile } from '../types';
import { DownloadIcon } from './Icons';

interface ImageCardProps {
  title: string;
  imageFile: ImageFile;
  isDownloadable?: boolean;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ImageCard: React.FC<ImageCardProps> = ({ title, imageFile, isDownloadable = false }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col animate-[fadeIn_0.5s_ease-in-out]">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
      </div>
      <div className="p-4 flex-grow">
        <div className="aspect-video bg-gray-900 rounded-md overflow-hidden mb-4 flex items-center justify-center">
          <img
            src={imageFile.url}
            alt={imageFile.name}
            className="object-contain max-w-full max-h-full"
          />
        </div>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span className="font-medium text-gray-300">Dimensions:</span>
            <span>{`${imageFile.width} x ${imageFile.height}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-300">File Size:</span>
            <span>{formatBytes(imageFile.size)}</span>
          </div>
        </div>
      </div>
      {isDownloadable && (
        <div className="p-4 mt-auto bg-gray-800/50">
          <a
            href={imageFile.url}
            download={`resized-${imageFile.name}`}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            <DownloadIcon className="w-5 h-5" />
            Download Image
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
