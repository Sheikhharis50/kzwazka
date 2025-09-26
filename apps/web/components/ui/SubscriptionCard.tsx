import Image from 'next/image';
import React from 'react';
import LocationImage from '@/images/loc2.png';
import { Check, Location } from 'svgs';
import Button from './Button';

const SubscriptionCard = () => {
  const facilities = [
    'Access to weekly training sessions',
    'Basic strength and conditioning workouts',
    'Participation in local wrestling events',
    'Personalized coaching feedback',
    'Parent support & progress reports',
  ];

  return (
    <div className="rounded-[10px] p-3 bg-smoke flex flex-col gap-4 text-[10px]">
      <Image
        src={LocationImage}
        alt="location image"
        height={200}
        width={400}
        className="w-full h-[123px] object-cover rounded-lg"
      />
      <div className="flex gap-2">
        <Location />
        <div>
          <h5 className="text-base">Main Arena, Zone A</h5>
          <p>Address: 15 South Lane, Bamber Bridge</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <p className="text-[9px]">From</p>
          <p className="w-full p-2 bg-white rounded-sm">MON , 12:00 - 01:00</p>
        </div>
        <div>
          <p className="text-[9px]">To</p>
          <p className="w-full p-2 bg-white rounded-sm">FRI , 4:00 - 5:00</p>
        </div>
      </div>
      <hr className="border-dashed border-white" />
      <div className="flex justify-between text-sm">
        <h5>Monthly Plan</h5>
        <h5>$200 / month</h5>
      </div>
      <div className="space-y-0.5">
        {facilities.map((facility, index) => (
          <div key={index} className="flex items-center gap-1">
            <Check />
            <p className="text-mute">{facility}</p>
          </div>
        ))}
      </div>
      <Button text="Activate Membership" className="!text-sm w-[90%] mx-auto" />
    </div>
  );
};

export default SubscriptionCard;
