
import { ImageFile } from '../types';

const TARGET_WIDTH = 2880;
const TARGET_HEIGHT = 2304;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const getBlobFromCanvas = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas to Blob conversion failed'));
                }
            },
            'image/jpeg',
            quality
        );
    });
};

export const resizeImage = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const { width: originalWidth, height: originalHeight } = img;

        const scaleFactorWidth = (TARGET_WIDTH + 1) / originalWidth;
        const scaleFactorHeight = (TARGET_HEIGHT + 1) / originalHeight;
        const scaleFactor = Math.max(scaleFactorWidth, scaleFactorHeight);

        const newWidth = Math.ceil(originalWidth * scaleFactor);
        const newHeight = Math.ceil(originalHeight * scaleFactor);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        try {
            // Binary search for the best quality under 5MB
            let bestBlob: Blob | null = null;
            let low = 0;
            let high = 1;
            
            // Try highest quality first
            const initialBlob = await getBlobFromCanvas(canvas, 1);
            if (initialBlob.size <= MAX_FILE_SIZE_BYTES) {
                 bestBlob = initialBlob;
            } else {
                 // Iterate to find the optimal quality
                for (let i = 0; i < 10; i++) { // 10 iterations are enough for good precision
                    const mid = (low + high) / 2;
                    const blob = await getBlobFromCanvas(canvas, mid);
                    if (blob.size <= MAX_FILE_SIZE_BYTES) {
                        bestBlob = blob; // This is a potential candidate
                        low = mid; // Try for higher quality
                    } else {
                        high = mid; // Quality is too high
                    }
                }
            }


            if (!bestBlob) {
                // As a fallback, try a very low quality if no suitable blob was found
                bestBlob = await getBlobFromCanvas(canvas, 0.5);
                if (bestBlob.size > MAX_FILE_SIZE_BYTES) {
                   return reject(new Error(`Could not compress the image under ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`));
                }
            }
            
            resolve({
                url: URL.createObjectURL(bestBlob),
                name: file.name,
                width: newWidth,
                height: newHeight,
                size: bestBlob.size,
            });

        } catch (error) {
            reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
  });
};
