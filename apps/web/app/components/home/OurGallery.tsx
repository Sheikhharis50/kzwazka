import React from 'react';
import Container from './Container';
import Title from '../ui/Title';
import { galleryCol1, galleryCol2, galleryCol3 } from '@/constants/gallery';
import Image, { StaticImageData } from 'next/image';
import BgImg from '@/images/gallery-bg.png';
import Button from '../Button';

const OurGallery = () => {
  const galleryImage = (image: StaticImageData) => (
    <Image
      src={image}
      alt="gallery image"
      height={500}
      width={600}
      className={`w-full h-auto mb-5`}
    />
  );

  return (
    <section className="bg-smoke pt-16 sm:pt-20 relative overflow-hidden">
      <Image
        src={BgImg}
        alt="white ellipse"
        width={1500}
        height={2000}
        className="w-full h-auto absolute top-0 left-0 pointer-events-none"
      />
      <div className="absolute bg-white bottom-0 w-full h-2/3 md:hidden" />
      <Container className="px-3 xs:px-12 sm:px-20 md:px-32 lg:px-40 xl:px-44 2xl:px-48 relative">
        <Title className="text-center">Nasza Galeria</Title>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-5 translate-y-5 md:translate-y-10 xl:translate-y-14">
          <div>{galleryCol1.map((image) => galleryImage(image))}</div>
          <div className="pt-8 lg:pt-12 xl:pt-20">
            {galleryCol2.map((image) => galleryImage(image))}
          </div>
          <div className="hidden md:block">
            {galleryCol3.map((image) => galleryImage(image))}
          </div>
        </div>
      </Container>
      <div className="absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-white via-white to-transparent" />
      <Button
        className="!bg-white !text-black absolute bottom-1/5 left-1/2 -translate-x-1/2 pointer-events-auto shadow-lg !py-1 !gap-1"
        text="Więcej"
        icon={
          <span className="text-xl md:text-2xl xl:text-3xl font-light mb-1">
            +
          </span>
        }
      />
    </section>
  );
};

export default OurGallery;
