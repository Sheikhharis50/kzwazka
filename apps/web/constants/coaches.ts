import Coach1Img from '@/images/coach1.png';
// import Coach2Img from '@/images/coach2.png';
import Coach3Img from '@/images/coach3.png';
import { SortBy } from 'types';

export const coachesData = [
  {
    imageSrc: Coach1Img,
    name: 'Jakub Antoszewski',
    description: 'Mistrz Polski wychowujący młodych sportowców z pasją.',
    expertise: ['Autorytet', 'Mistrzostwo', 'Fair Play'],
    phone: '+48 533 505 567',
  },
  // {
  //   imageSrc: Coach2Img,
  //   name: 'Petro Valchuk',
  //   description: 'Trener, który rozbudza pasję i uczy techniki.',
  //   expertise: ['Dyscyplina', 'Technika', 'Zaangażowanie'],
  //   phone: '+48 885 549 658',
  // },
  {
    imageSrc: Coach3Img,
    name: 'Szymon Domański',
    description: 'Pełen energii trener, który motywuje do działania.',
    expertise: ['Energia', 'Wytrwałość', 'Precyzja'],
    phone: '+48  884 343 898',
  },
];

export const sortByOptions = [
  // { label: 'Group', value: 'group' },
  { label: 'Joined', value: SortBy.CREATED_AT },
];

export const coachesTableHeader = ['Profile', 'Name', 'Email', 'Phone Number'];
