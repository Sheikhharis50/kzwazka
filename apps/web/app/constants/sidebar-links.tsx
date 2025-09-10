import {
  Dashboard,
  Calendar,
  Location,
  Bell,
  Insurance,
  Billing,
  Users,
  Group,
  Book,
} from '@/svgs';
import { SidebarLink } from '@/types';

export const sidebarLinks: SidebarLink[] = [
  {
    id: 'dashboard',
    name: 'Main Dashboard',
    icon: <Dashboard className="size-5 md:size-6" />,
    url: '/dashboard',
    access: { role: undefined, permissions: '' },
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: <Calendar className="size-5 md:size-6" />,
    url: '/dashboard/calendar',
    access: { role: undefined, permissions: '' },
  },
  {
    id: 'training-locations',
    name: 'Training Locations',
    icon: <Location className="size-5 md:size-6" />,
    url: '/dashboard/training-locations',
    access: { role: undefined, permissions: '' },
  },
  {
    id: 'broadcast',
    name: 'Broadcast Alerts',
    icon: <Bell className="size-5 md:size-6" />,
    url: '/dashboard/broadcast',
    access: { role: undefined, permissions: '' },
  },
  {
    id: 'kids',
    name: 'Kids',
    icon: <Users className="size-5 md:size-6" />,
    url: '/dashboard/kids',
    access: { role: undefined, permissions: '' },
  },
  {
    id: 'coaches',
    name: 'Coaches',
    icon: <Group className="size-5 md:size-6" />,
    url: '/dashboard/coaches',
    access: { role: 'admin', permissions: '' },
  },
  {
    id: 'groups',
    name: 'Groups',
    icon: <Book className="size-5 md:size-6" />,
    url: '/dashboard/groups',
    access: { role: undefined, permissions: '' },
  },
  {
    id: 'insurance',
    name: 'Insurance Status',
    icon: <Insurance className="size-5 md:size-6" />,
    url: '/dashboard/insurance',
    access: { role: undefined, permissions: '' },
  },
  {
    id: 'payment',
    name: 'Billing & Payment',
    icon: <Billing className="size-5 md:size-6" />,
    url: '/dashboard/payment',
    access: { role: undefined, permissions: '' },
  },
];
