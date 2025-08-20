'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import LocationCard from './LocationCard';
import { trainingLocations } from '@/constants/training-locations';

const TrainingLocationsCard = () => {
  const handleNewLocation = () => {
    console.log('add a new location');
  };

  return (
    <DashboardCard
      title="Training locations"
      button={{ text: 'Add New Location', action: handleNewLocation }}
    >
      <div className="w-full overflow-x-auto scrollbar-hidden">
        <div className="flex gap-5 p-5 w-fit">
          {trainingLocations.map((loc, index) => (
            <LocationCard
              dashboard
              {...loc}
              key={`${index}-location-${loc.venue}`}
            />
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};

export default TrainingLocationsCard;
