import Image, { StaticImageData } from 'next/image';
import React from 'react';
import CalendarIcon from '@/icons/calendar.png';
import ClockIcon from '@/icons/clock.png';
import PinIcon from '@/icons/pin.png';
import BullsEyeIcon from '@/icons/bullseye.png';
import Arrow from '@/svgs/ArrowLeft';
import { redirect } from 'next/navigation';

interface EventCardProps {
  imageSrc: string | StaticImageData;
  title: string;
  date: string;
  time: string;
  venue: string;
  level: string;
  link: string;
}

const EventCard = ({
  imageSrc,
  title,
  date,
  time,
  venue,
  level,
  link,
}: EventCardProps) => {
  const cardInfo = [
    { title: 'Date', detail: date, icon: CalendarIcon },
    { title: 'Time', detail: time, icon: ClockIcon },
    { title: 'Venue', detail: venue, icon: PinIcon },
    { title: 'Level', detail: level, icon: BullsEyeIcon },
  ];

  return (
    <div className="rounded-[14px] bg-white overflow-hidden w-60 hover:shadow-xl">
      <Image
        src={imageSrc}
        alt={venue}
        height={500}
        width={500}
        className="w-full h-36 rounded-[14px] object-cover"
      />
      <div className="px-3 py-4">
        <h3 className="text-lg truncate text-black mb-3" title={title}>
          {title}
        </h3>
        {cardInfo.map((info, index) => (
          <div
            key={`${title}-${venue}-${index}`}
            className="flex items-baseline gap-1 mb-1"
          >
            <Image
              src={info.icon}
              alt={info.title}
              width={50}
              height={50}
              className="w-3 h-auto object-contain"
            />
            <p
              className="text-[10px] text-[#232323] truncate"
              title={`${info.title}: ${info.detail}`}
            >{`${info.title}: ${info.detail}`}</p>
          </div>
        ))}
        <button
          className="flex gap-1 items-center text-red text-[10px] mt-2"
          onClick={() => redirect(link)}
        >
          View details <Arrow className="rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
