import TrainingLocationsCard from '@/components/dashboard/cards/TrainingLocationsCard';
import UpcomingEventsCard from '@/components/dashboard/cards/UpcomingEventsCard';
import Heading from '@/components/ui/Heading';
import React from 'react';

const Dashboard = () => {
  return (
    <div className="px-3 md:px-5 my-5 md:my-8">
      <Heading text="Main Dashboard" small className="mb-5 md:mb-8" />
      <div className="grid md:grid-cols-2 gap-5">
        <UpcomingEventsCard />
        <TrainingLocationsCard />
      </div>
    </div>
  );
};

export default Dashboard;
