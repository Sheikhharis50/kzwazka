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
import Modal from 'components/ui/Modal';
import { useSearchParams } from 'next/navigation';
import { PaymentFailed } from 'svgs/PaymentFailed';
import { PaymentSuccess } from 'svgs/PaymentSuccess';
import YellowRibbon from '@/images/modal-yellow-ribbon.png';

const Subscription = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentModal, setCurrentModal] = React.useState<
    'success' | 'error' | undefined
  >();
  const success = currentModal === 'success';

  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  React.useEffect(() => {
    if (status === 'success') {
      setCurrentModal('success');
      setIsModalOpen(true);
    } else if (status === 'error') {
      setCurrentModal('error');
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      setCurrentModal(undefined);
    }
  }, [status]);

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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size={success ? 'lg' : 'md'}
      >
        {success && (
          <Image
            src={YellowRibbon}
            alt="ribbon"
            height={200}
            width={200}
            className="absolute top-0 right-0 w-[120px] sm:w-[150px] md:w-[170px] h-auto"
          />
        )}
        <div className="flex flex-col gap-3 items-center justify-center text-center">
          {success ? (
            <PaymentSuccess className="w-20 md:w-28 h-auto" />
          ) : (
            <PaymentFailed className="w-20 md:w-28 h-auto" />
          )}
          <Heading
            text={
              success
                ? 'Subscription Activated Successfully!'
                : 'Error in purchase!'
            }
            small
          />
          <Paragraph
            mute
            className="2xl:!text-base"
            text={
              success
                ? 'Your subscription is now active. Enjoy uninterrupted access to our services!'
                : 'Please try again or try another way to confirm this purchase.'
            }
          />
        </div>
      </Modal>
    </>
  );
};

export default Subscription;
