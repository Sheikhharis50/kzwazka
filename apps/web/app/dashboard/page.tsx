import TrainingLocationsCard from '@/components/dashboard/cards/TrainingLocationsCard';
import UpcomingEventsCard from '@/components/dashboard/cards/UpcomingEventsCard';
import React from 'react';

const Dashboard = () => {
  return (
    <div className="px-3 grid grid-cols-2 gap-5">
      <UpcomingEventsCard />
      <TrainingLocationsCard />
    </div>
  );
};

export default Dashboard;
