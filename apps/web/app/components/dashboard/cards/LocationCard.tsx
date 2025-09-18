import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { Location, ViewOnMap, Trash, Share, Edit, Group, Clock } from 'svgs';
import Button from '../../Button';

interface LocationCardProps {
  imageSrc: string | StaticImageData;
  title: string;
  venue: string;
  kids: number;
  coach: { name: string; profile: StaticImageData | string };
  time: string;
  dashboard?: boolean;
}

const LocationCard = ({
  imageSrc,
  title,
  venue,
  kids,
  coach,
  time,
  dashboard = false,
}: LocationCardProps) => {
  const visibleOnDashboard = dashboard ? '' : 'hidden';
  const visibleOnLocations = dashboard ? 'hidden' : '';

  return (
    <div
      className={`rounded-[14px] bg-white overflow-hidden hover:shadow-xl relative ${dashboard ? 'text-xs w-60' : 'w-full text-sm border border-border'}`}
    >
      <Image
        src={imageSrc}
        alt={venue}
        height={500}
        width={500}
        className="w-full h-36 rounded-[14px] object-cover"
      />
      <Trash
        className={`absolute right-2 top-2 cursor-pointer text-white ${visibleOnDashboard}`}
      />
      <div className="py-4">
        <div className="flex items-center gap-2 justify-between mb-1 px-3">
          <h3 className="text-lg truncate text-black flex-1" title={title}>
            {title}
          </h3>
          <Edit className={visibleOnLocations} />
        </div>
        <div
          className={`flex items-center gap-1 ${dashboard ? 'mb-5' : 'mb-2'} px-3`}
        >
          <Location className="size-6" />
          <p className="text-[#232323] truncate" title={venue}>
            {venue}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 mb-3 px-3 ${visibleOnLocations}`}
        >
          <Group className="size-6" />
          <p className="text-[#232323] truncate" title={`${kids} Kids`}>
            {kids} Kids
          </p>
        </div>
        <hr className={`border-border ${visibleOnLocations}`} />
        <div
          className={`flex items-center gap-3 pt-2 pb-1 px-3 text-[#232323] ${visibleOnLocations}`}
        >
          <p>Main Coach:</p>
          <div className="flex gap-2 items-center">
            <Image
              src={coach.profile}
              alt={coach.name}
              width={50}
              height={50}
              className="object-cover size-9 rounded-full"
            />
            <p className="truncate">{coach.name}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-3 mb-5 ${visibleOnLocations}`}
        >
          <Clock className="size-6" />
          <p className="text-[14px]">{time}</p>
        </div>
        <div className="flex items-center justify-between px-3">
          <Button
            text={dashboard ? 'View Details' : 'View on Maps'}
            className={dashboard ? 'text-xs!' : 'text-sm!'}
            icon={dashboard ? undefined : <ViewOnMap className="size-5" />}
          />
          <ViewOnMap className={visibleOnDashboard} />
          <Share className={visibleOnDashboard} />
          <Trash className={`size-5 cursor-pointer ${visibleOnLocations}`} />
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
