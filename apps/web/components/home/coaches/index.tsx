import React from 'react';
import Title from 'components/ui/Title';
import CoachCard from './Card';
import { coachesData } from 'constants/coaches';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import Container from '../Container';
import Image from 'next/image';
import YellowRibbon from '@/images/yellow-ribbon.png';

const Coaches = () => {
  return (
    <section className="py-10 md:py-20 bg-smoke relative">
      <Image
        src={YellowRibbon}
        alt="yellow ribbon"
        height={500}
        width={700}
        className="w-[30%] h-2/5 bottom-1/5 left-0 absolute hidden md:block"
      />
      <Container className="mb-5 md:mb-10 relative">
        <Title className="text-center md:w-4/5 mx-auto">
          DOŚWIADCZENI I LICENCJONOWANI TRENERZY ZAPASÓW, KTÓRYM MOŻESZ ZAUFAĆ”
        </Title>
      </Container>
      {/* w-[95vw] xs:w-[85vw] md:w-[75vw] min-[950px]:w-[95vw] lg:max-w-[90vw] 2xl:max-w-[1400px] */}
      <div className="w-[95vw] xs:w-4/5 md:w-[95vw] lg:w-4/5 xl:w-2/3 2xl:max-w-[1000px] mx-auto relative">
        <Swiper
          slidesPerView={1}
          breakpoints={{
            // 640: { slidesPerView: 1.2, spaceBetween: 25 },
            768: { slidesPerView: 2, spaceBetween: 25 },
            // 950: { slidesPerView: 2, spaceBetween: 25 },
            // 1250: { slidesPerView: 2.5, spaceBetween: 25 },
            // 1500: { slidesPerView: 3, spaceBetween: 15 },
          }}
          pagination={{ clickable: true }}
          modules={[Pagination]}
        >
          {coachesData.map((coach) => (
            <SwiperSlide key={coach.name}>
              <div className="pb-10 md:pb-0">
                <CoachCard {...coach} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Coaches;
