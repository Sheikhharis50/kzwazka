import Heading from '@/components/Heading';
import React from 'react';
import Image from 'next/image';
import { Camera, Trash } from '@/svgs';

interface ModalLayoutProps {
  preview: string | null;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  children?: React.ReactNode;
  heading?: string;
}

const ModalLayout = ({
  error,
  handleFileChange,
  preview,
  removeFile,
  children,
  heading = 'Add Kid',
}: ModalLayoutProps) => {
  return (
    <div className="flex flex-col gap-5 lg:gap-10 items-center justify-center relative">
      <Heading text={heading} small />
      <div>
        <div className="rounded-full bg-smoke size-24 flex flex-col justify-center gap-1 items-center relative mx-auto">
          {preview ? (
            <div className="rounded-full overflow-hidden">
              <Image
                src={preview}
                alt="kid image"
                height={300}
                width={300}
                className="w-full h-auto object-cover"
              />
              <button
                className="bg-red text-white p-1 rounded-full absolute top-3 right-0"
                onClick={removeFile}
              >
                <Trash className="w-3 h-auto" />
              </button>
            </div>
          ) : (
            <>
              <Camera />
              <p className="text-[10px]">Add Picture</p>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                className="absolute size-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
        {error && (
          <span
            className={`text-[10px] md:text-xs xl:text-sm text-red text-center`}
          >
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

export default ModalLayout;
