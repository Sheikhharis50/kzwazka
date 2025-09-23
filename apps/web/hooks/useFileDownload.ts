import { useMutation } from '@tanstack/react-query';
import * as api from 'api';
import { toast } from 'react-toastify';

export function useFileDownload() {
  return useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      const blob = await api.auth.downloadFile({ url });
      return { blob, url };
    },
    onSuccess: ({ blob, url }) => {
      const filename = extractFilenameFromUrl(url);

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success('File downloaded successfully');
    },
    onError: (error) => {
      console.error('Error downloading file:', error);
      toast.error('Error downloading the file, try again later');
    },
  });
}

function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'download';

    return filename.split('?')[0] || 'file';
  } catch {
    return url.split('/').pop()?.split('?')[0] || 'download';
  }
}
