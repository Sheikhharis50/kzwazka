import {
  Dashboard,
  Calendar,
  Location,
  Bell,
  Insurance,
  Billing,
  Users,
} from '@/svgs';

export const sidebarLinks = [
  {
    id: 'dashboard',
    name: 'Main Dashboard',
    icon: <Dashboard className="size-5 md:size-6" />,
    url: '/dashboard',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: <Calendar className="size-5 md:size-6" />,
    url: '/dashboard/calendar',
  },
  {
    id: 'training-locations',
    name: 'Training Locations',
    icon: <Location className="size-5 md:size-6" />,
    url: '/dashboard/training-locations',
  },
  {
    id: 'broadcast',
    name: 'Broadcast Alerts',
    icon: <Bell className="size-5 md:size-6" />,
    url: '/dashboard/broadcast',
  },
  {
    id: 'kids',
    name: 'Kids',
    icon: <Users className="size-5 md:size-6" />,
    url: '/dashboard/kids',
  },
  {
    id: 'insurance',
    name: 'Insurance Status',
    icon: <Insurance className="size-5 md:size-6" />,
    url: '/dashboard/insurance',
  },
  {
    id: 'payment',
    name: 'Billing & Payment',
    icon: <Billing className="size-5 md:size-6" />,
    url: '/dashboard/payment',
  },
];
