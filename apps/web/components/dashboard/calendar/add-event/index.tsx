import React from 'react';
import Heading from 'components/ui/Heading';
import HomeButton from 'components/home/Button';
import TrainingEventForm from './training-event';
import OneTimeEventForm from './one-time-event';

const AddEventForm = ({ closeModal }: { closeModal: () => void }) => {
  const [isTrainingType, setIsTrainingType] = React.useState<boolean>(true);

  return (
    <>
      <Heading text="Add New Event" className={`text-center`} />
      <p
        className={`text-center text-[11px] xs:text-xs mt-2 ${isTrainingType ? 'hidden' : ''}`}
      >
        Fill in the details below to schedule a new event. <br /> Make sure to
        double-check the time and location before saving.
      </p>
      <div className="flex items-center justify-center my-5 lg:my-8 2xl:my-10">
        <HomeButton
          text="Training"
          className={` flex-1 !rounded-none
            ${isTrainingType ? '' : 'bg-smoke !text-black'}
          `}
          onClick={() => setIsTrainingType(true)}
        />
        <HomeButton
          text="One Time"
          className={`flex-1 !rounded-none
            ${isTrainingType ? 'bg-smoke !text-black' : ''}
          `}
          onClick={() => setIsTrainingType(false)}
        />
      </div>
      {isTrainingType ? (
        <TrainingEventForm closeModal={closeModal} />
      ) : (
        <OneTimeEventForm closeModal={closeModal} />
      )}
    </>
  );
};

export default AddEventForm;
