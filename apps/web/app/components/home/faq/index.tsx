import React from 'react';
import Accordion from './Accordion';
import Container from '../Container';
import Title from '@/components/ui/Title';
import Paragraph from '@/components/Paragraph';
import Image from 'next/image';
import RedRibbon from '@/images/red-ribbon.png';
import { faqs } from 'constants/faqs';

const FAQ = () => {
  return (
    <section className="bg-smoke py-10 md:py-20 relative">
      <Image
        src={RedRibbon}
        alt="ribbon"
        height={700}
        width={500}
        className="w-1/4 h-[430px] xl:h-[500px] translate-x-[-25%] absolute left-0 top-0 hidden lg:block"
      />
      <Container className="lg:px-20 relative">
        <Title className="text-center">FAQ</Title>
        <Paragraph
          className="text-center xs:w-2/3 sm:w-1/2 mx-auto mb-5 md:mb-10"
          text="👋 Jeśli jesteś tu pierwszy raz, to pewnie masz sporo pytań. I dobrze! Rodzice, którzy pytają, to rodzice, którzy dbają. Tu znajdziesz odpowiedzi na te najczęstsze."
        />
        <Accordion faqs={faqs} />
      </Container>
    </section>
  );
};

export default FAQ;
