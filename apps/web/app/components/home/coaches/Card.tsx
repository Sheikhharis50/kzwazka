import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Heading from '@/components/Heading';
import HomeButton from '../Button';
import { Phone } from '@/svgs';
import Link from 'next/link';

interface CoachCardProps {
  imageSrc: string | StaticImageData;
  name: string;
  description: string;
  expertise: string[];
  phone: string;
}

const CoachCard = ({
  description,
  expertise,
  imageSrc,
  name,
  phone,
}: CoachCardProps) => {
  return (
    <div className="p-3 pb-6 space-y-5 text-center bg-white rounded-md">
      <Image
        src={imageSrc}
        alt={`coach-${name}`}
        width={500}
        height={700}
        className="w-full h-auto"
      />
      <div>
        <Heading text={name} small className="mb-1 md:!text-2xl" />
        <p className="text-[10px] sm:text-[12px]">{description}</p>
      </div>
      <div className="flex gap-2 justify-center">
        {expertise.map((experty) => (
          <div
            key={`coach-${name}-${experty}`}
            className="px-3 py-1 text-[10px] sm:text-[12px] bg-[#6E86C4] text-white rounded-full flex-1"
          >
            {experty}
          </div>
        ))}
      </div>
      <Link href={`tel:${phone}`}>
        <HomeButton
          text={phone}
          icon={<Phone className="w-5 md:w-6" />}
          className="mx-auto"
        />
      </Link>
    </div>
  );
};

export default CoachCard;
