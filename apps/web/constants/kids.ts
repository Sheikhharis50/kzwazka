import { SortBy } from 'types';

export const kidsTableHeader = [
  'Player',
  'Player Name',
  'Age',
  'Skill Level',
  'joined at',
  'Payment Status',
];

export const paymentStatusOptions = [
  { label: 'Clear', value: 'clear' },
  { label: 'Refund', value: 'refund' },
  { label: 'Delay', value: 'delay' },
];

export const sortByOptions = [
  { label: 'Age', value: SortBy.DOB },
  { label: 'Joined', value: SortBy.CREATED_AT },
];
