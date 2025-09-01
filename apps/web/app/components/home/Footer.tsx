import React from 'react';
import Container from './Container';
import Logo from '@/icons/logo-footer.png';
import Image from 'next/image';
import { address, socialLinks } from '@/constants/footer-links';
import Paragraph from '../Paragraph';
import Link from 'next/link';
import Heading from '../Heading';
import HomeButton from './Button';
import { navLinks } from '@/constants/nav-links';

const Footer = () => {
  return (
    <footer className="bg-black py-10 lg:py-20 text-white">
      <Container>
        <Image
          src={Logo}
          alt="Kzwazka Logo"
          width={450}
          height={300}
          className="w-40 md:w-52 lg:w-60 h-auto mb-5 md:mb-8"
        />
        <div className="flex flex-col lg:flex-row gap-8 md:gap-10 xl:gap-40 justify-between xl:justify-start">
          <div className="space-y-1">
            {address.map((val) => (
              <Paragraph key={val} text={val} />
            ))}
            <div className="flex gap-5 items-baseline pt-3 md:pt-5 lg:pt-10">
              {socialLinks.map((link) => (
                <Link
                  href={link.url}
                  key={link.name}
                  className="size-10 md:size-12 rounded-full bg-white flex items-center justify-center"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Heading
              text="KZ Ważka"
              className="!font-Inter mb-2 lg:mb-6 font-bold"
              xs
            />
            {navLinks.map((link) => (
              <Link
                href={link.url}
                key={link.id}
                className="inline-block lg:block mr-5 lg:mr-0"
              >
                <Paragraph text={link.name} />
              </Link>
            ))}
          </div>
          <div>
            <Paragraph text="All Rights Reserved 2025  WAZKA WARSZAWA" />
            <Link href={'/regulamin-klubu'} className="block mb-5 lg:mb-14">
              <Paragraph text="Regulamin Klubu" />
            </Link>
            <div className="flex gap-2 xs:gap-3">
              <HomeButton text="Zapisz się na trening" className="md:py-3" />
              <HomeButton text="Zobacz lokalizacje" className="md:py-3" />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
