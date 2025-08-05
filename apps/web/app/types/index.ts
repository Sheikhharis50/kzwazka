import { StaticImageData } from 'next/image';

type SidebarLink = {
  id: string;
  name: string;
  icon: StaticImageData | string;
  url: string;
};

type Option = {
  value: string | number;
  label: string;
};

export type { SidebarLink, Option };
