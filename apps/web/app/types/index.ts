import { StaticImageData } from 'next/image';

type SidebarLink = {
  id: string;
  name: string;
  icon: StaticImageData | string;
  url: string;
};

export type { SidebarLink };
