import React from 'react';
import Container from './Container';
import Heading from '../ui/Heading';
import Paragraph from '../ui/Paragraph';
import HomeButton from './Button';
import Image from 'next/image';
import Ribbon from '@/images/login-ribbon.png';
import { contactDetail, phoneNumberLink } from 'constants/contact';
import Link from 'next/link';

const Contact = () => {
  return (
    <section className="bg-yellow pt-2 pb-5 md:py-5 relative overflow-hidden">
      <Image
        src={Ribbon}
        alt="ribbon"
        width={300}
        height={300}
        className="w-[150px] md:w-[100px] 2xl:w-[140px] h-auto absolute right-0 top-0"
      />
      <Container className="md:flex items-center relative">
        {contactDetail.map((contact, index) => (
          <div
            key={contact.label}
            className={`py-3 md:py-5 2xl:py-8 ${index !== contactDetail.length - 1 ? 'md:border-r' : ''} border-black/80 flex-1`}
          >
            <div className={index !== 0 ? 'md:w-fit md:mx-auto' : ''}>
              <Heading text={contact.label} xs className="mb-1 2xl:mb-2" />
              <Paragraph text={contact.value} />
            </div>
          </div>
        ))}
        <Link href={phoneNumberLink}>
          <HomeButton
            text="Zapisz się →"
            className="mx-auto md:mx-0 mt-2 md:mt-0"
          />
        </Link>
      </Container>
    </section>
  );
};

export default Contact;
