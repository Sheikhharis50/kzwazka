import Paragraph from '@/components/Paragraph';
import Select from '@/components/Select';
import { ICoach } from 'api/type';
import Image from 'next/image';
import React from 'react';
import Placeholder from '@/images/placeholder.jpg';
import { Edit, Mail, Phone, Trash, Users } from '@/svgs';

interface ICoachProps extends ICoach {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const CoachCard = ({
  user: coach,
  group,
  id,
  onEdit,
  onDelete,
}: ICoachProps) => {
  const coachInfo = [
    { icon: <Mail className="w-4 2xl:w-[18px] h-auto" />, value: coach.email },
    {
      icon: <Phone className="w-4 2xl:w-[18px] h-auto" />,
      value: coach.phone || 'N/A',
    },
    {
      icon: <Users className="w-4 2xl:w-[18px] h-auto" />,
      value: group?.[0]?.name || 'N/A',
    },
  ];

  return (
    <div className="rounded-md p-2 grid grid-cols-[30%_70%] items-center bg-smoke">
      <div className="relative">
        <Image
          src={coach.photo_url || Placeholder}
          alt="coach"
          height={400}
          width={300}
          className="w-full h-auto rounded-sm object-cover bg-black/20"
        />
        <div className="absolute top-0 right-0 px-2 py-1.5 flex justify-between w-full">
          <button onClick={() => onDelete(id)}>
            <Trash className="w-3 md:w-4 h-auto" />
          </button>
          <button onClick={() => onEdit(id)}>
            <Edit className="w-4 md:w-5 h-auto" />
          </button>
        </div>
      </div>
      <div className="pl-3 2xl:pl-5 space-y-1 2xl:space-y-2">
        <div className="flex items-center justify-between gap-1">
          <Paragraph
            text={`${coach.first_name} ${coach.last_name}`}
            className="truncate font-semibold"
            title={`${coach.first_name} ${coach.last_name}`}
          />
          <Select
            options={[
              { label: 'Available', value: 'available' },
              { label: 'Unavailable', value: 'unavailable' },
            ]}
            defaultValue={coach.is_active ? 'available' : 'unavailable'}
            classes={{
              input: `!text-[10px] !rounded-full !py-0.5 md:!py-1 !px-1 outline-none !w-fit  ${
                coach.is_active
                  ? '!bg-[#D6ECD9] !text-[#319F43] !border-[#319F43]'
                  : '!bg-[#FF903533] !text-[#FF9035] !border-[#FF9035]'
              }`,
            }}
          />
        </div>
        {coachInfo.map((info, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {info.icon}
            <p className="text-xs">{info.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachCard;
