'use client';
import React, { useEffect, useRef } from 'react';
import Container from '../Container';
import Title from '@/components/ui/Title';
import Logo from '@/images/world-wresling-logo.png';
import Trophy from '@/images/trophy.png';
import Image from 'next/image';
import Paragraph from '@/components/Paragraph';
import { worldWrestlingData } from '@/constants/world-of-wrestling';
import CarousalCard from './CarousalCard';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

const WorldOfWrestling = () => {
  const swiperRef = useRef<SwiperRef>(null);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.updateAutoHeight();
    }
  }, []);

  return (
    <section className="bg-yellow py-10 md:pt-20">
      <Container>
        <Title className="text-center mb-3">
          AUT{' '}
          <Image
            src={Logo}
            alt="kzwazka"
            height={200}
            width={200}
            className="w-6 sm:w-8 md:w-10 lg:w-12 2xl:w-14 h-auto inline-block mb-2"
          />{' '}
          RYTETY ŚWIATA ZAPASÓW Z <br className="hidden xs:inline-block" /> NAMI
          <Image
            src={Trophy}
            alt="trophy"
            height={200}
            width={200}
            className="w-6 sm:w-8 md:w-10 lg:w-12 2xl:w-14 h-auto inline-block ml-2 mb-2"
          />
        </Title>
        <Paragraph
          text="Zapasy w naszym klubie polecają legendy sportu. To najlepsza rekomendacja i inspiracja dla dzieci marzących o wielkich osiągnięciach"
          className="text-center sm:w-4/5 lg:w-3/5 mx-auto"
        />
        <Swiper
          ref={swiperRef}
          observeParents
          observeSlideChildren
          observer
          slidesPerView={1}
          spaceBetween={10}
          modules={[Pagination]}
          pagination={{ clickable: true }}
        >
          {worldWrestlingData.map((data, index) => (
            <SwiperSlide
              key={data.title}
              className="!h-auto !flex !items-stretch"
            >
              <CarousalCard
                {...data}
                classes={{
                  image:
                    index === 0
                      ? 'lg:-translate-y-8 xl:-translate-y-12'
                      : 'lg:pb-8',
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
};

export default WorldOfWrestling;
