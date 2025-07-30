import {
  DashboardIcon,
  BillingIcon,
  BroadcastIcon,
  CalendarIcon,
  InsuranceIcon,
} from '@/icons/sidebarIcons';

const sidebarLinks = [
  {
    id: 'dashboard',
    name: 'Main Dashboard',
    icon: DashboardIcon,
    url: '/dashboard',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: CalendarIcon,
    url: '/dashboard/calendar',
  },
  {
    id: 'broadcast',
    name: 'Broadcast Alerts',
    icon: BroadcastIcon,
    url: '/dashboard/broadcast',
  },
  {
    id: 'insurance',
    name: 'Insurance Status',
    icon: InsuranceIcon,
    url: '/dashboard/insurance',
  },
  {
    id: 'payment',
    name: 'Billing & Payment',
    icon: BillingIcon,
    url: '/dashboard/payment',
  },
];

export { sidebarLinks };
