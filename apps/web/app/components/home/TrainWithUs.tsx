import React from 'react';
import Container from './Container';
import TrainImage from '@/images/train-with-us.png';
import Image from 'next/image';
import Title from '../ui/Title';
import Paragraph from '../Paragraph';
import HomeButton from './Button';
import Link from 'next/link';
import { phoneNumberLink } from 'constants/contact';

const TrainWithUs = () => {
  return (
    <Container className="bg-black md:px-8 lg:px-12 xl:px-14 grid grid-cols-1 md:grid-cols-2 items-center mb-10 md:mb-20">
      <Image
        src={TrainImage}
        alt="kzwazka surprise win"
        width={600}
        height={800}
        className="w-full sm:w-3/4 md:w-full h-auto mx-auto translate-y-[6%] md:translate-y-[20%] pr-5 lg:pr-16 xl:pr-20 order-2 md:order-1"
      />
      <div className="text-white py-10 px-5 md:px-0 order-1 md:order-2">
        <Title className="mb-3">
          <span className="text-yellow">TRENUJ Z NAMI</span> <br /> I WYGRAJ
          SPRZĘT
        </Title>
        <Paragraph
          text="Każdy nowy uczestnik treningów bierze udział w losowaniu sprzętu zapaśniczego. Rozstrzygnięcie konkursu już w listopadzie 2025."
          className="mb-5 md:mb-10 xl:mb-12"
        />
        <div className="flex items-center">
          <Link href={phoneNumberLink}>
            <HomeButton text="Zapisz się!" className="mr-5 md:mr-8 xl:mr-10" />
          </Link>
          {/* <Image
            src={PlayButton}
            alt="play button"
            height={80}
            width={80}
            className="w-8 md:w-10 xl:w-12 h-auto mr-2 md:mr-4"
          />
          <Paragraph text="Obejrzyj Teraz" /> */}
        </div>
      </div>
    </Container>
  );
};

export default TrainWithUs;
