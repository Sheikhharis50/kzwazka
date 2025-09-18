import Heading from 'components/ui/Heading';
import React from 'react';
import Image from 'next/image';
import { Camera, Edit, Trash } from 'svgs';
import Placeholder from '@/images/placeholder.jpg';

interface ModalLayoutProps {
  preview: string | null;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  children?: React.ReactNode;
  heading?: string;
  defaultPhoto?: string;
  group?: boolean;
}

const ModalLayout = ({
  error,
  handleFileChange,
  preview,
  removeFile,
  children,
  heading = 'Add Kid',
  defaultPhoto,
  group = false,
}: ModalLayoutProps) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex flex-col gap-5 lg:gap-10 items-center justify-center relative">
      <Heading text={heading} />
      <div>
        <div
          className={`${group ? 'rounded-lg bg-[#F0F3F9] h-24 xl:h-32 w-28 xl:w-36' : 'rounded-full bg-smoke size-24'} flex justify-center items-center relative mx-auto`}
        >
          <div
            className={`${defaultPhoto || preview ? 'block' : 'hidden'} ${group ? 'rounded-lg' : 'rounded-full'} size-full overflow-hidden`}
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
                className={`bg-red text-white p-1 rounded-full absolute ${group ? '-top-1 -right-1' : 'top-3 right-0'} `}
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
            <Camera className={`mx-auto w-5 h-auto ${group ? 'xl:w-7' : ''}`} />
            <p
              className={`${group ? 'xl:text-xs' : ''} text-[10px] text-center`}
            >
              {group ? 'Add Group Image' : 'Add Picture'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="absolute top-0 left-0 size-full opacity-0 cursor-pointer"
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
