import Button from 'components/ui/Button';
import LocationCard from 'components/dashboard/cards/LocationCard';
import Heading from 'components/ui/Heading';
import Paragraph from 'components/ui/Paragraph';
import { trainingLocations } from 'constants/training-locations';
import React from 'react';

const TrainingLocationsPage = () => {
  return (
    <div className="h-full ps-3 flex flex-col gap-10 overflow-y-auto py-5">
      <div className="flex justify-between items-start">
        <div>
          <Heading text="Training Locations" small className="mb-2" />
          <Paragraph text="Please choose location for upcoming event or tranning." />
        </div>
        <Button text="Add New Location" />
      </div>
      <div className="grid grid-cols-4 gap-5 h-fit">
        {trainingLocations.map((loc, index) => (
          <LocationCard {...loc} key={`${index}-location-${loc.venue}`} />
        ))}
      </div>
    </div>
  );
};

export default TrainingLocationsPage;
