'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import LocationCard from './LocationCard';
import LocationImg1 from '@/images/event3.png';
import LocationImg2 from '@/images/event4.png';

const TrainingLocationsCard = () => {
  const handleNewLocation = () => {
    console.log('add a new location');
  };

  const upcomingLocations = [
    {
      imageSrc: LocationImg1,
      title: 'South Hall, Mat 1',
      venue: '15 South Lane, Bamber Bridge',
    },
    {
      imageSrc: LocationImg2,
      title: 'South Hall, Mat 1',
      venue: '15 South Lane, Bamber Bridge',
    },
    {
      imageSrc: LocationImg1,
      title: 'South Hall, Mat 1',
      venue: '15 South Lane, Bamber Bridge',
    },
    {
      imageSrc: LocationImg2,
      title: 'South Hall, Mat 1',
      venue: '15 South Lane, Bamber Bridge',
    },
    {
      imageSrc: LocationImg1,
      title: 'South Hall, Mat 1',
      venue: '15 South Lane, Bamber Bridge',
    },
    {
      imageSrc: LocationImg2,
      title: 'South Hall, Mat 1',
      venue: '15 South Lane, Bamber Bridge',
    },
  ];

  return (
    <DashboardCard
      title="Training locations"
      button={{ text: 'Add New Location', action: handleNewLocation }}
    >
      <div className="w-full overflow-x-auto scrollbar-hidden">
        <div className="flex gap-5 p-5 w-fit">
          {upcomingLocations.map((loc, index) => (
            <LocationCard {...loc} key={`${index}-location-${loc.venue}`} />
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};

export default TrainingLocationsCard;
