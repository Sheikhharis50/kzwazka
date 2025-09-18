import React from 'react';
import Container from './Container';
import Image from 'next/image';
import Image1 from '@/images/wrestling-sport1.png';
import Image2 from '@/images/wrestling-sport2.png';
import Paragraph from '@/components/ui/Paragraph';
import Title from '@/components/ui/Title';

const WrestlingSport = () => {
  return (
    <section className="bg-smoke">
      <Container className="py-10 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-10 md:gap-0">
        <Image
          src={Image1}
          alt="kzwazka wrestling"
          width={500}
          height={800}
          className="w-full sm:w-3/4 md:w-full h-auto mx-auto md:-translate-x-[12%]"
        />
        <div className="">
          <Title className="mb-3">
            ZAPASY – SPORT, KTÓRY <br className="md:hidden" /> BUDUJE CHARAKTER
          </Title>
          <Paragraph
            text="Zapasy to wszechstronny sport, który rozwija ciało i umysł, uczy dyscypliny, współpracy i pewności siebie. Treningi dają dzieciom siłę, zwinność i koncentrację, a zawody przynoszą emocje i doświadczenia, które zostają na całe życie."
            mute
            className="mb-5 sm:mb-10 lg:mb-12 2xl:mb-20"
          />
          <Image
            src={Image2}
            alt="kzwazka wrestling"
            width={800}
            height={500}
            className="w-full h-auto"
          />
        </div>
      </Container>
    </section>
  );
};

export default WrestlingSport;
