'use client';

import React from 'react';
import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import Contact from '@/components/home/Contact';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Contact />
    </>
  );
}
