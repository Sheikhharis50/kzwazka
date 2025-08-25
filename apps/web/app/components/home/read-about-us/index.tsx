import React from 'react';
import Container from '../Container';
import BlogCard from './BlogCard';
import Image from 'next/image';
import WrestlingImage from '@/images/read-about-us3.png';
import Heading from '@/components/Heading';
import { blogCardData } from '@/constants/blog-card';

const ReadAboutUs = () => {
  return (
    <Container className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 2xl:gap-20 md:py-20 py-10 items-center">
      <div className="space-y-5 md:space-y-8">
        <Heading text="Read About us" className="2xl:text-[40px]" />
        {blogCardData.map((data) => (
          <BlogCard key={data.title} {...data} />
        ))}
      </div>
      <div className="relative w-full sm:w-2/3 lg:w-full mx-auto">
        <Image
          src={WrestlingImage}
          alt="Kzwazka wrestling blog article image"
          height={1500}
          width={1000}
          className="w-full h-auto"
        />
        <div className="size-full absolute left-0 top-0 px-3 py-4 xs:p-5 md:p-8 xl:p-10 text-white flex flex-col justify-between">
          <Heading
            text="WRESTLING"
            xs
            className="!font-Inter w-fit py-1 px-2 border border-white rounded-sm"
          />
          <div>
            <Heading
              text="Debits - 03 June 2023"
              xs
              className="!font-Inter font-light mb-2"
            />
            <Heading text="DISCOVER THE MEMBER BENEFITS OF USA CYCLING!" />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ReadAboutUs;
