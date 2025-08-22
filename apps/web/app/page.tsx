'use client';

import React from 'react';
import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import Contact from '@/components/home/Contact';
import WrestlingSport from '@/components/home/WrestlingSport';
import TrainingLocations from '@/components/home/training-locations';
import AgeGroup from '@/components/home/AgeGroup';
import TrainWithUs from '@/components/home/TrainWithUs';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Contact />
      <WrestlingSport />
      <TrainingLocations />
      <AgeGroup />
      <TrainWithUs />
    </>
  );
}
