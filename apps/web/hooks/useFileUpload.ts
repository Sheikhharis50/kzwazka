import { useState, useEffect } from 'react';

interface UseFileUploadOptions {
  maxSize?: number;
  validTypes?: string[];
}

export function useFileUpload({
  maxSize = 500 * 1024,
  validTypes = ['png', 'jpeg', 'jpg'],
}: UseFileUploadOptions = {}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | undefined>(undefined);

  function formatFileSize(bytes: number): string {
    const kb = 1024;
    const mb = kb * 1024;

    if (bytes < mb) {
      return `${Math.round(bytes / kb)} KB`;
    }
    return `${(bytes / mb).toFixed(1)} MB`;
  }

  const formatted = validTypes
    .map((t) => t.toUpperCase())
    .reduce((acc, curr, idx, arr) => {
      if (idx === 0) return curr;
      if (idx === arr.length - 1) return `${acc} and ${curr}`;
      return `${acc}, ${curr}`;
    }, '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setFile(file);

    if (!validTypes.includes(file.name.split('.')?.pop() || '')) {
      console.log(file.type);
      setError(`'Only ${formatted} files are allowed'`);
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setError(`File size must not exceed ${formatFileSize(maxSize)}`);
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
    file,
    setFile,
  };
}
