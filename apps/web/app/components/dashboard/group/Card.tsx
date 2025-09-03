import React from 'react';
import Image from 'next/image';
import Placeholder from '@/images/placeholder.jpg';
import { IGroup } from 'api/type';
import Button from '@/components/Button';
import { Location } from '@/svgs';

interface GroupCardProps {
  group: IGroup;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const address =
    [group?.location?.address1, group?.location?.city, group?.location?.state]
      .filter(Boolean)
      .join(', ') || 'N/A';

  const groupInfo = [
    {
      label: 'Age Category',
      value:
        [group?.min_age, group?.max_age].filter(Boolean).join(' - ') || 'N/A',
    },
    { label: 'Skill Level', value: `${group?.skill_level || 'N/A'}` },
    {
      label: 'Maximum Members',
      value: `${group?.max_group_size || 'N/A'}`,
    },
    {
      label: 'Coach Name',
      value: (
        <div className="flex items-center gap-1">
          <Image
            src={group?.coach?.photo_url || Placeholder}
            alt="coach image"
            className="size-5 rounded-full object-cover"
          />
          <p className="flex-1 truncate" title={group?.coach?.name || 'N/A'}>
            {group?.coach?.name || 'N/A'}
          </p>
        </div>
      ),
      title: group?.coach?.name || 'N/A',
    },
    {
      label: 'Training Schedule',
      value: `${'N/A'}`,
    },
    {
      label: 'Insurance Completion',
      value: `${'Yes'}`,
    },
    {
      label: 'Address',
      value: (
        <div className="flex items-center gap-1">
          <Location className="w-4 h-auto" />
          <p className="flex-1 truncate" title={address}>
            {address}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[#F0F3F9] rounded-xl p-2 xs:p-3 xl:p-2 grid grid-cols-1 xl:grid-cols-[45%_55%]">
      <div className="bg-white rounded-xl border border-border border-dashed overflow-hidden h-[180px] xs:h-[230px] md:h-[270px] xl:h-full w-1/2 sm:w-2/3 xl:w-auto relative xl:mr-2 2xl:mr-5 min-[1700px]:mr-8">
        <Image src={group?.photo_url || Placeholder} alt="group image" fill />
      </div>
      <div className="space-y-2 sm:space-y-4 xl:space-y-2 2xl:space-y-4 pt-3 2xl:pt-5 min-[1700px]:pt-8">
        <p
          className="text-[20px] truncate font-semibold"
          title={group?.name || 'N/A'}
        >
          {group?.name || 'N/A'}
        </p>
        <div className="space-y-1.5 2xl:space-y-2">
          {groupInfo.map((info) => (
            <div
              key={info.label}
              className="grid grid-cols-2 gap-3 text-[12px]"
            >
              <p>{info.label}</p>
              {typeof info.value === 'string' ? (
                <p className="truncate font-semibold" title={info.value}>
                  {info.value}
                </p>
              ) : (
                info.value
              )}
            </div>
          ))}
        </div>
        <Button
          text="Go to Attendance"
          className="w-full xl:w-[95%] !text-[12px] mt-5 sm:mt-0 mb-2 xl:mb-0 2xl:mb-2 xl:py-3"
        />
      </div>
    </div>
  );
};

export default GroupCard;
