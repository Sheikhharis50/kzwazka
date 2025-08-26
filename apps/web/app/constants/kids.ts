import image1 from '@/images/kid1.png';
import image2 from '@/images/kid2.png';
import image3 from '@/images/kid3.png';
import image4 from '@/images/kid4.png';
import image5 from '@/images/kid5.png';
import image6 from '@/images/kid6.png';

export const kidsTableHeader = [
  'Player',
  'Player Name',
  'Age',
  'Skill Level',
  'joined at',
  'Payment Status',
];

export const kidsTableData = [
  {
    imageSrc: image1,
    name: 'Kevin',
    age: '6 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
  {
    imageSrc: image2,
    name: 'Pookie Man',
    age: '7 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
  {
    imageSrc: image3,
    name: 'Gogie',
    age: '9 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'refund',
  },
  {
    imageSrc: image4,
    name: 'Tokie',
    age: '4 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
  {
    imageSrc: image5,
    name: 'Ayaan',
    age: '6 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'delay',
  },
  {
    imageSrc: image6,
    name: 'Alexandar',
    age: '7 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
  {
    imageSrc: image1,
    name: 'Ali',
    age: '6 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
  {
    imageSrc: image2,
    name: 'Ahmed',
    age: '7 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
  {
    imageSrc: image3,
    name: 'Choaaaa Chin',
    age: '9 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'refund',
  },
  {
    imageSrc: image4,
    name: 'Muhammad Kasim',
    age: '4 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
  {
    imageSrc: image5,
    name: 'Haider',
    age: '6 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'delay',
  },
  {
    imageSrc: image6,
    name: 'Haris',
    age: '7 Years',
    skillLevel: 'Beginner',
    joinedAt: '12 May 2025',
    paymentStatus: 'clear',
  },
];

export const paymentStatusOptions = [
  { label: 'Clear', value: 'clear' },
  { label: 'Refund', value: 'refund' },
  { label: 'Delay', value: 'delay' },
];

export const sortByOptions = [
  { label: 'Age', value: 'age' },
  { label: 'Group', value: 'group' },
  { label: 'Joined', value: 'joined' },
];
