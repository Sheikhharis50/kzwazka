import Image from 'next/image';
import LogoSrc from '@/icons/logo.svg';

const Logo = ({ className = '' }: { className?: string }) => {
  return (
    <Image
      src={LogoSrc}
      width={500}
      height={500}
      alt="kzwazka logo"
      className={`w-full max-w-[86px] xl:max-w-24 2xl:max-w-[105px] h-auto object-contain relative ${className}`}
    />
  );
};

export default Logo;
