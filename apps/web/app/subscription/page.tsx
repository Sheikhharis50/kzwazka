'use client';
import Heading from 'components/ui/Heading';
import Logo from 'components/ui/Logo';
import Paragraph from 'components/ui/Paragraph';
import React from 'react';
import { Arrow } from 'svgs';
import Image from 'next/image';
import Ribbon from '@/images/login-ribbon.png';
import Circle from '@/images/red-half-circle.png';
import SubscriptionCard from 'components/ui/SubscriptionCard';
import LogoMobile from 'components/ui/LogoMobile';

const Subscription = () => {
  return (
    <>
      <div className="m-2 rounded-3xl md:rounded-4xl 2xl:rounded-[42px] bg-yellow p-5 md:p-8 relative overflow-hidden 2xl:h-[50dvh]">
        <Image
          src={Ribbon}
          alt="ribbon"
          width={500}
          height={500}
          className="w-1/3 h-full absolute top-0 right-0 hidden md:block"
        />
        <Image
          src={Circle}
          alt="circle red"
          width={500}
          height={500}
          className="w-[15%] h-full absolute top-0 right-0 hidden md:block"
        />
        <div className="flex gap-5 lg:gap-8 items-center mb-5 lg:mb-0">
          <Logo className="hidden md:block" />
          <LogoMobile className="md:hidden" />
          <button
            className="flex gap-1.5 items-center"
            onClick={() => window.history.back()}
          >
            <Arrow />
            <Paragraph text="Go back" />
          </button>
        </div>
        <div className="text-center lg:-translate-y-[20%]">
          <Heading text="Choose Location to pay for" className="mb-1" />
          <Heading text="training workspace" className="mb-2" />
          <Paragraph text="Please choose your plan and pay for subscription " />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 px-3 md:px-5 2xl:px-20 2xl:-translate-y-1/4 py-5 md:py-10 2xl:py-0">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className={
                index === 1 || index === 3
                  ? '2xl:-translate-y-[10%]'
                  : index === 2
                    ? '2xl:-translate-y-[25%]'
                    : ''
              }
            >
              <SubscriptionCard />
            </div>
          ))}
      </div>
    </>
  );
};

export default Subscription;
