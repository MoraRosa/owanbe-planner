import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onSuccess?: (dataUrl: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    maxSizeMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    onSuccess,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = useCallback(async (file: File): Promise<string | null> => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Accepted: ${acceptedTypes.join(', ')}`);
      return null;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File too large. Maximum size: ${maxSizeMB}MB`);
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }, [maxSizeMB, acceptedTypes]);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const dataUrl = await processFile(file);
      if (dataUrl) {
        setPreview(dataUrl);
        onSuccess?.(dataUrl);
        toast.success('Image uploaded successfully!');
        return dataUrl;
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
    return null;
  }, [processFile, onSuccess]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  }, [handleFileSelect]);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    uploading,
    preview,
    setPreview,
    handleFileSelect,
    handleInputChange,
    clearPreview,
    acceptedTypes,
  };
}
