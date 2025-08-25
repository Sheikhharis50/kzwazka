'use client';

import React from 'react';
import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import Contact from '@/components/home/Contact';
import WrestlingSport from '@/components/home/WrestlingSport';
import TrainingLocations from '@/components/home/training-locations';
import AgeGroup from '@/components/home/AgeGroup';
import TrainWithUs from '@/components/home/TrainWithUs';
import ReadAboutUs from '@/components/home/read-about-us';
import Footer from '@/components/home/Footer';
import Coaches from '@/components/home/coaches';
import WorldOfWrestling from '@/components/home/world-of-wrestling';
import OurGallery from '@/components/home/OurGallery';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Contact />
      <WrestlingSport />
      <TrainingLocations />
      <AgeGroup />
      <WorldOfWrestling />
      <Coaches />
      <OurGallery />
      <TrainWithUs />
      <ReadAboutUs />
      <Footer />
    </>
  );
}
