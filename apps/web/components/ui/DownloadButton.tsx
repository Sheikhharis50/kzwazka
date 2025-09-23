import { useFileDownload } from 'hooks/useFileDownload';
import React from 'react';
import Loader from './Loader';
import { Arrow } from 'svgs';

const DownloadButton = ({ url }: { url: string }) => {
  const download = useFileDownload();
  return (
    <button
      className={`p-1 border rounded-sm ms-auto w-fit md:hidden mt-1 group-hover:block group-active:block group-focus:block bg-gray-600/20 shadow-lg border-smoke absolute bottom-0.5 right-0.5 backdrop-blur-xs`}
      disabled={download.isPending}
      onClick={() => download.mutateAsync({ url })}
    >
      {download.isPending ? (
        <Loader black className="!size-3 md:!size-4" />
      ) : (
        <Arrow className="text-black w-2.5 md:w-3.5 h-auto -rotate-90" />
      )}
    </button>
  );
};

export default DownloadButton;
