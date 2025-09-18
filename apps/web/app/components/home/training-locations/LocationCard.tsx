import Image, { StaticImageData } from 'next/image';
import React from 'react';
import { Check, GoogleLocation, Location } from 'svgs';
import Paragraph from '@/components/ui/Paragraph';
import HomeButton from '../Button';
import Link from 'next/link';
import { phoneNumberLink } from 'constants/contact';

interface LocationCardProps {
  imageSrc: string | StaticImageData;
  title: string;
  venue: string;
  ageGroups: string[];
  facilities: string[];
  locationLink: string;
  className?: string;
}

const LocationCard = ({
  imageSrc,
  title,
  venue,
  ageGroups,
  facilities,
  locationLink,
  className = '',
}: LocationCardProps) => {
  return (
    <div
      className={`p-2 lg:p-3 border-2 border-smoke bg-white rounded-md text-[#232323] flex flex-col gap-5 w-full overflow-hidden ${className} hover:shadow-xl`}
    >
      <Image
        src={imageSrc}
        alt={title}
        height={500}
        width={800}
        className="w-full h-auto"
      />
      <div className="flex gap-0.5 lg:gap-1 2xl:gap-2 w-full">
        <Location className="size-5 lg:size-6 text-black shrink-0" />
        <div className="flex-1 min-w-0">
          <h3
            className="lg:text-lg 2xl:text-[21px] truncate text-black"
            title={title}
          >
            {title}
          </h3>
          <Paragraph
            text={venue}
            className="2xl:!text-base truncate"
            title={venue}
          />
        </div>
      </div>
      <div className="flex gap-1">
        {ageGroups.map((group) => (
          <div
            key={`group-${group}-${title}`}
            className="px-2 2xl:px-3 py-1.5 2xl:py-2 bg-smoke rounded-sm flex-1"
          >
            <p className="text-xs 2xl:text-sm">{group}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {facilities.map((facility) => (
          <div
            key={`facility-${title}-${facility}`}
            className="flex gap-1 items-center"
          >
            <Check className="shrink-0" />
            <Paragraph
              text={facility}
              className="2xl:!text-base truncate"
              title={facility}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <Link href={phoneNumberLink} className="flex-1">
          <HomeButton text="Zapisz się →" className="w-full" />
        </Link>
        <div className="px-3 lg:px-5">
          <Link href={locationLink} target="_blank">
            <GoogleLocation className="shrink-0 w-4 lg:w-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
