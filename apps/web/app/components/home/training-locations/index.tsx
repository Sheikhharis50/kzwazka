'use client';

import React from 'react';
import Title from '../../ui/Title';
import LocationCard from './LocationCard';
import { trainingLocationsHome } from '@/constants/training-locations';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import Ribbon from '@/images/red-ribbon.png';
import Logo from '@/icons/training-loc-logo.png';
import Image from 'next/image';
import Container from '../Container';

const TrainingLocations = () => {
  return (
    <section id="training-locations" className="py-10 md:py-20 relative">
      <Image
        src={Ribbon}
        alt="ribbon"
        width={400}
        height={500}
        className="w-1/5 h-[55%] left-0 top-0 absolute hidden md:block"
      />
      {/* w-full md:w-[95vw] lg:max-w-[90vw] 2xl:max-w-[1400px] mx-auto  */}
      <Container className="relative">
        <Title className="text-center mb-5 md:mb-8">
          Lokalizacje Treningów
        </Title>
        {/* <div className="hidden md:grid grid-cols-3 gap-5 2xl:gap-10 2xl:px-20 pt-10 lg:pt-14">
          {trainingLocationsHome.map((tl, index) => (
            <LocationCard
              {...tl}
              key={tl.title}
              className={
                index === 1 ? '-translate-y-10 lg:-translate-y-[56px]' : ''
              }
            />
          ))}
        </div> */}
        <div className="lg:w-2/3 mx-auto">
          <Swiper
            slidesPerView={1}
            spaceBetween={10}
            pagination={{ clickable: true }}
            // className="!pt-10 md:!hidden"
            modules={[Pagination]}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 20 },
              550: { slidesPerView: 2 },
              // 450: { slidesPerView: 1.5 },
            }}
          >
            {trainingLocationsHome.map((tl) => (
              <SwiperSlide key={tl.title}>
                {/* ${isActive ? '-translate-y-10 lg:-translate-y-[56px]' : 'translate-y-0'}
                {({ isActive }) => (
                )} */}
                <div className="pb-10 min-[550px]:pb-0">
                  <LocationCard {...tl} className={`transition-transform`} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <Image
          src={Logo}
          alt="logo"
          width={300}
          height={300}
          className="size-[200px] right-[-15%] xl:right-[-12%] 2xl:right-[-5%] top-[5%] absolute hidden lg:block invert-100"
        />
      </Container>
    </section>
  );
};

export default TrainingLocations;
