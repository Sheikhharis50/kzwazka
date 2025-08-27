import { useState, useEffect } from 'react';

interface UseFileUploadOptions {
  maxSize?: number;
  validTypes?: string[];
}

export function useFileUpload({
  maxSize = 500 * 1024,
  validTypes = ['image/png', 'image/jpeg', 'image/jpg'],
}: UseFileUploadOptions = {}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!validTypes.includes(file.type)) {
      setError('Only PNG, JPG, and JPEG files are allowed');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError(`File size must not exceed ${Math.round(maxSize / 1024)}KB`);
      e.target.value = '';
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);

    const reader = new FileReader();
    reader.onloadend = () => setBase64(reader.result as string);
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setBase64('');
    setError('');
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return {
    preview,
    base64,
    error,
    handleFileChange,
    removeFile,
  };
}
