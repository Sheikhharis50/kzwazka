import { ICoach } from 'api/type';
import React from 'react';
import CoachCard from './CoachCard';

interface CoachGridViewProps {
  data: ICoach[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const CoachGridView = ({ data, onDelete, onEdit }: CoachGridViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 2xl:gap-5 px-3 2xl:px-5">
      {data.map((coach: ICoach) => (
        <CoachCard
          key={coach.id}
          {...coach}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CoachGridView;
