import { Facebook, Instagram, Youtube } from '@/svgs';

export const address = [
  'KLUB ZAPAŚNICZY WAŻKA WARSZAWA',
  'KRS 0001170424',
  'NIP',
  '5253044473',
  'REGON',
  '541586194',
];

export const socialLinks = [
  {
    name: 'youtube',
    icon: <Youtube className="w-6 md:w-9 h-auto" />,
    url: '#',
  },
  {
    name: 'facebook',
    icon: <Facebook className="w-5 md:w-7 h-auto" />,
    url: '#',
  },
  {
    name: 'instagram',
    icon: <Instagram className="w-5 md:w-7 h-auto" />,
    url: '#',
  },
];

export const footerLinks = [
  { id: 'about', name: 'About', url: '/about' },
  { id: 'coach', name: 'Coach', url: '/coach' },
  { id: 'contact', name: 'Contact', url: '/contact' },
  { id: '1-time-fee', name: '1-time Fee', url: '/1-time-fee' },
  { id: 'products', name: 'Products', url: '/products' },
];
