import Heading from '@/components/Heading';
import React from 'react';
import Image from 'next/image';
import { Camera, Edit, Trash } from '@/svgs';
import Placeholder from '@/images/placeholder.jpg';

interface ModalLayoutProps {
  preview: string | null;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  children?: React.ReactNode;
  heading?: string;
  defaultPhoto?: string;
}

const ModalLayout = ({
  error,
  handleFileChange,
  preview,
  removeFile,
  children,
  heading = 'Add Kid',
  defaultPhoto,
}: ModalLayoutProps) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex flex-col gap-5 lg:gap-10 items-center justify-center relative">
      <Heading text={heading} small />
      <div>
        <div className="rounded-full bg-smoke size-24 flex justify-center items-center relative mx-auto">
          <div
            className={`${defaultPhoto || preview ? 'block' : 'hidden'} rounded-full overflow-hidden`}
          >
            <Image
              src={preview || defaultPhoto || Placeholder}
              alt="profile image"
              height={300}
              width={300}
              className="w-full h-auto object-cover"
            />
            {preview ? (
              <button
                className="bg-red text-white p-1 rounded-full absolute top-3 right-0"
                onClick={removeFile}
              >
                <Trash className="w-3 h-auto" />
              </button>
            ) : defaultPhoto ? (
              <button
                className="bg-smoke text-black p-1 rounded-full absolute top-3 right-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Edit className="w-3 h-auto" />
              </button>
            ) : null}
          </div>
          <div className={!defaultPhoto && !preview ? 'space-y-1' : 'hidden'}>
            <Camera className="mx-auto" />
            <p className="text-[10px] text-center">Add Picture</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="absolute size-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>
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
