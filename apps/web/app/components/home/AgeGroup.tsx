import React from 'react';
import Container from './Container';
import Title from '../ui/Title';
import Heading from '../Heading';
import Paragraph from '../Paragraph';
import { ageGroupsData } from '@/constants/age-group';
import HomeButton from './Button';
import AgeGroupImage from '@/images/age-group.png';
import Image from 'next/image';

const AgeGroup = () => {
  return (
    <section className="py-10 md:py-20 bg-smoke">
      <Container className="grid md:grid-cols-[55%_45%] xl:grid-cols-[60%_40%] gap-8 sm:gap-10 md:gap-0 items-center">
        <div className="space-y-5 xl:space-y-8">
          <Title>Grupy wiekowe</Title>
          <div className="space-y-3 xl:space-y-5">
            {ageGroupsData.map((data) => (
              <div
                key={data.age}
                className="rounded-md bg-white px-5 xl:px-8 py-3 xl:py-5 hover:shadow-lg flex justify-between items-center"
              >
                <div>
                  <Heading text={data.age} xs className="2xl:text-[28px]" />
                  {data.facilities.map((facility) => (
                    <Paragraph
                      key={`${data.age}-${facility}`}
                      text={facility}
                    />
                  ))}
                </div>
                <Paragraph
                  text={data.price}
                  className="!font-Inter font-bold 2xl:text-xl"
                />
              </div>
            ))}
          </div>
          <HomeButton
            text="1-szy darmowy trening"
            className="py-3 mx-auto md:mx-0 "
          />
        </div>
        <Image
          src={AgeGroupImage}
          alt="wrestling group"
          width={800}
          height={1200}
          className="w-full sm:w-2/3 md:w-full mx-auto h-auto md:pl-5 xl:pl-10"
        />
      </Container>
    </section>
  );
};

export default AgeGroup;
