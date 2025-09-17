import React from 'react';
import Input from '@/components/Input';
import Heading from '@/components/Heading';
import HomeButton from '@/components/home/Button';
import { useCoach } from '@/hooks/useCoach';
import Select from '@/components/Select';
import { useLocation } from '@/hooks/useLocation';
import { useGroup } from '@/hooks/useGroup';

const AddEventForm = () => {
  const [isTrainingType, setIsTrainingType] = React.useState<boolean>(true);
  const { coachOptions } = useCoach();
  const { locationOptions } = useLocation();
  const { groupOptions } = useGroup();

  return (
    <>
      <Heading text="Add New Event" className={`text-center`} />
      <p
        className={`text-center text-xs mt-2 ${isTrainingType ? 'hidden' : ''}`}
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
      <form className="w-full space-y-3 md:space-y-5">
        <Input label="Event Title" placeholder="Please enter event title" />
        <Input type="date" label="Event Date" />
        <Select
          numberValue
          defaultValue={0}
          label="Select Coach"
          options={coachOptions}
          placeholder="Select Coach"
        />
        <div className="grid grid-cols-2 gap-1 md:gap-3">
          <Input type="time" label="Event Start Time" />
          <Input type="time" label="Event End Time" />
        </div>
        <Select
          numberValue
          defaultValue={0}
          label="Select Location"
          options={locationOptions}
          placeholder="Select Location"
        />
        <Select
          numberValue
          defaultValue={0}
          label="Select Group"
          options={groupOptions}
          placeholder="Select Group"
        />
      </form>
    </>
  );
};

export default AddEventForm;
