import React from 'react';
import heroBG from '@/images/hero-bg.png';
import heroBGMob from '@/images/hero-bg-mob.png';
import heroKids from '@/images/hero-kids.png';
import Image from 'next/image';
import Paragraph from 'components/ui/Paragraph';
import HomeButton from 'components/home/Button';
import { Phone } from 'svgs';
import Title from 'components/ui/Title';
import Link from 'next/link';
import { phoneNumberLink } from 'constants/contact';
import { scrollIntoView } from 'utils/scrollIntoView';

const HeroSection = () => {
  return (
    <div className="bg-sky relative grid md:grid-cols-[55%_45%] 2xl:grid-cols-[60%_40%]">
      <Image
        src={heroBG}
        alt="bg image"
        width={1800}
        height={1500}
        className="w-2/3 h-full absolute left-0 top-0 hidden md:block pointer-events-none"
      />
      <Image
        src={heroBGMob}
        alt="bg image"
        width={1800}
        height={1500}
        className="w-full h-[85%] absolute left-0 top-0 md:hidden pointer-events-none"
      />
      <Image
        src={heroKids}
        alt="kzwazka wrestling model kids"
        width={1500}
        height={1500}
        className="w-full sm:w-2/3 md:w-full mx-auto h-auto relative pt-10 md:pt-20 order-2 md:order-1"
      />
      <div className="relative xs:w-4/5 sm:w-2/3 md:w-full px-5 lg:px-8 min-[1200px]:px-10 2xl:px-14 my-auto text-white order-1 md:order-2 pt-10 md:pt-0">
        <Title className="mb-3">
          ODKRYJ NOWĄ JAKOŚĆ <br /> TRENINGÓW <br /> ZAPAŚNICZYCH
        </Title>
        <Paragraph
          text="Dołącz do klubu, gdzie dzieci budują siłę, pewność siebie i sportowy charakter – na macie i w życiu."
          className="mb-5 md:mb-8 lg:mb-10 2xl:mb-14"
        />
        <div className="flex gap-3 md:gap-5">
          <Link href={phoneNumberLink} className="block min-w-[35%]">
            <HomeButton
              text="Zadzwoń"
              icon={<Phone className="size-5 md:size-6" />}
              className="w-full"
            />
          </Link>
          <HomeButton
            text="Zobacz lokalizacje"
            className="min-w-[35%]"
            onClick={() => scrollIntoView('training-locations')}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
