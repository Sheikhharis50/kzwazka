import React from 'react';
import Heading from 'components/ui/Heading';
import { Arrow, Quotation, Youtube } from 'svgs';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

interface CarousalCardProps {
  title: string;
  winnerOf: { name: string; icon: StaticImageData };
  quote: string;
  watchLink: string;
  imageSrc: StaticImageData;
  classes?: { image?: string };
}

const CarousalCard = ({
  imageSrc,
  quote,
  title,
  watchLink,
  winnerOf,
  classes,
}: CarousalCardProps) => {
  const { image = '' } = classes || {};
  return (
    <div className="pt-8 lg:pt-14 2xl:pt-16 h-full">
      <div className="bg-smoke rounded-4xl grid grid-cols-1 lg:grid-cols-[58%_42%] gap-10 lg:gap-0 py-10 lg:py-0 items-center h-full">
        <div className="px-8 lg:pl-12 xl:pl-16 2xl:pl-20 lg:pe-5 2xl:pr-8">
          <Heading text={title} className="2xl:text-5xl" />
          <div className="flex gap-4 xl:gap-6 items-center py-5 xl:py-8 2xl:py-10">
            <Image
              src={winnerOf.icon}
              alt={winnerOf.name}
              height={300}
              width={200}
              className="w-10 xl:w-12 2xl:w-14 h-auto"
            />
            <Heading text={winnerOf.name} xs className="!font-Inter" />
          </div>
          <div className="relative pb-8 2xl:pb-10">
            <Quotation className="absolute -left-6 lg:-left-[6%] -top-4 w-5 xl:w-7 2xl:w-9" />
            <Quotation className="absolute right-0 bottom-0 rotate-180 w-5 xl:w-7 2xl:w-9" />
            <Heading text={quote} xs className="!font-Inter relative" />
          </div>
          <Link href={watchLink} target="_blank">
            <div className="flex items-center gap-3 md:gap-4">
              <Youtube className="w-10 md:w-12 2xl:w-14 h-auto" />
              <Heading text="Obejrzyj" xs className="!font-Inter relative" />
              <Arrow className="rotate-[145deg]" />
            </div>
          </Link>
        </div>
        <Image
          src={imageSrc}
          alt=""
          height={800}
          width={600}
          className={`w-full sm:w-2/3 lg:w-full h-auto mx-auto ${image}`}
        />
      </div>
    </div>
  );
};

export default CarousalCard;
