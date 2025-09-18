import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Paragraph from '@/components/ui/Paragraph';
import Heading from '@/components/ui/Heading';

interface BlogCardProps {
  imageSrc: string | StaticImageData;
  title: string;
  subTitle: string;
  description: string;
}

const BlogCard = ({
  description,
  imageSrc,
  subTitle,
  title,
}: BlogCardProps) => {
  return (
    <div className="flex gap-2 xs:gap-3 md:gap-5 w-full h-full items-start xs:items-stretch lg:items-start">
      <Image
        src={imageSrc}
        alt="blog image"
        height={300}
        width={500}
        className="w-[40%] lg:w-[50%] h-auto object-contain mb-5 sm:mb-10 lg:mb-0"
      />
      <div className="border-b border-border pt-1 w-full">
        <Paragraph text={subTitle} mute className="mb-1" />
        <Heading text={title} className="mb-2 lg:mb-3" xs />
        <Paragraph text={description} className="mb-5 xs:mb-8 xl:mb-10" mute />
      </div>
    </div>
  );
};

export default BlogCard;
