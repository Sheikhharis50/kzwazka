import React from 'react';
import Logo from '@/icons/logo-home.png';
import Image from 'next/image';
// import { navLinks } from '@/constants/nav-links';
import Link from 'next/link';
import HomeButton from '@/components/home/Button';
import { ProfileRound, Hamburger } from 'svgs';
import HomeSidebar from '@/components/home/Sidebar';
import Container from '@/components/home/Container';

const HomeNavbar = () => {
  const [sidebarVisible, setSidebarVisibility] = React.useState(false);

  return (
    <>
      <nav className="bg-white py-2">
        <Container className="flex justify-between items-center">
          <Image
            src={Logo}
            alt="Kzwazka logo"
            height={500}
            width={500}
            className="w-[70px] md:w-24 lg:w-28 2xl:w-32 h-auto object-contain"
          />
          {/* <div className="hidden lg:flex gap-9 2xl:text-lg font-medium">
            {navLinks.map((link) => (
              <Link href={link.url} key={link.id}>
                {link.name}
              </Link>
            ))}
          </div> */}
          <div className="hidden lg:flex">
            <Link href={'#'}>
              <HomeButton
                text="LOGOWANIE"
                icon={<ProfileRound />}
                className="!bg-transparent !text-black !ps-0"
              />
            </Link>
            <Link href={'#'}>
              <HomeButton text="ZAPISZ SIĘ" />
            </Link>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarVisibility(true)}
          >
            <Hamburger />
          </button>
        </Container>
      </nav>
      <HomeSidebar isOpen={sidebarVisible} setOpen={setSidebarVisibility} />
    </>
  );
};

export default HomeNavbar;
