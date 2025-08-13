'use client';

import React from 'react';
import DashboardCard from './Card';
import EventCard from './EventCard';
import Event1Image from '@/images/event1.png';
import Event2Image from '@/images/event2.png';
import Event3Image from '@/images/event3.png';

const UpcomingEvents = () => {
  const handleNewEvent = () => {
    console.log('add a new event');
  };

  const upcomingEvents = [
    {
      imageSrc: Event1Image,
      title: 'Beginner’s Grapple Fest',
      date: 'June 10, 2025',
      time: '10:00 AM – 1:00 PM',
      venue: 'South Sports Hall, Main Arena',
      level: 'Ages 5–8 | Beginner only',
      link: '/dashboard/calendar',
    },
    {
      imageSrc: Event2Image,
      title: 'Beginner’s Grapple Fest',
      date: 'June 10, 2025',
      time: '10:00 AM – 1:00 PM',
      venue: 'South Sports Hall, Main Arena',
      level: 'Ages 5–8 | Beginner only',
      link: '/dashboard/calendar',
    },
    {
      imageSrc: Event3Image,
      title: 'Beginner’s Grapple Fest',
      date: 'June 10, 2025',
      time: '10:00 AM – 1:00 PM',
      venue: 'South Sports Hall, Main Arena',
      level: 'Ages 5–8 | Beginner only',
      link: '/dashboard/calendar',
    },
    {
      imageSrc: Event1Image,
      title: 'Beginner’s Grapple Fest',
      date: 'June 10, 2025',
      time: '10:00 AM – 1:00 PM',
      venue: 'South Sports Hall, Main Arena',
      level: 'Ages 5–8 | Beginner only',
      link: '/dashboard/calendar',
    },
    {
      imageSrc: Event2Image,
      title: 'Beginner’s Grapple Fest',
      date: 'June 10, 2025',
      time: '10:00 AM – 1:00 PM',
      venue: 'South Sports Hall, Main Arena',
      level: 'Ages 5–8 | Beginner only',
      link: '/dashboard/calendar',
    },
    {
      imageSrc: Event3Image,
      title: 'Beginner’s Grapple Fest',
      date: 'June 10, 2025',
      time: '10:00 AM – 1:00 PM',
      venue: 'South Sports Hall, Main Arena',
      level: 'Ages 5–8 | Beginner only',
      link: '/dashboard/calendar',
    },
  ];
  return (
    <DashboardCard
      title="Upcoming Events"
      button={{ text: '+ New Event', action: handleNewEvent }}
    >
      <div className="w-full overflow-x-auto scrollbar-hidden">
        <div className="flex gap-5 p-5 w-fit">
          {upcomingEvents.map((event, index) => (
            <EventCard {...event} key={`${index}-upcoming-event`} />
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};

export default UpcomingEvents;
