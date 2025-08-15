import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Location from '@/svgs/Location';
import Button from '../../Button';
import ViewOnMap from '@/svgs/ViewOnMap';
import Share from '@/svgs/Share';
import Trash from '@/svgs/Trash';

interface LocationCardProps {
  imageSrc: string | StaticImageData;
  title: string;
  venue: string;
}

const LocationCard = ({ imageSrc, title, venue }: LocationCardProps) => {
  return (
    <div className="rounded-[14px] bg-white overflow-hidden w-60 hover:shadow-xl relative">
      <Image
        src={imageSrc}
        alt={venue}
        height={500}
        width={500}
        className="w-full h-36 rounded-[14px] object-cover"
      />
      <Trash className="absolute right-2 top-2 cursor-pointer text-white" />
      <div className="px-3 py-4">
        <h3 className="text-lg truncate text-black mb-3" title={title}>
          {title}
        </h3>
        <div className="flex items-baseline gap-1 mb-5">
          <Location />
          <p className="text-xs text-[#232323] truncate" title={venue}>
            {venue}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Button text="View Details" className="text-xs!" />
          <ViewOnMap />
          <Share />
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
