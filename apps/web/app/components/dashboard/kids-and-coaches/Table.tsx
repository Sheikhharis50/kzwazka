import React from 'react';
import Image from 'next/image';
import { kidsTableHeader, paymentStatusOptions } from '@/constants/kids';
import { coachesTableHeader } from '@/constants/coaches';
import Select from '@/components/Select';
import { Edit, ProfileRound, Trash } from '@/svgs';
import Loader from '@/components/Loader';
import calculateAge from 'utils/calculateAge';
import formatDate from 'utils/formatDate';
import { IChild, ICoach } from 'api/type';
import Paragraph from '@/components/Paragraph';

interface TableProps {
  data: IChild[] | ICoach[] | undefined;
  isLoading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  coach?: boolean;
}

const Table = ({ data, isLoading, onDelete, onEdit, coach }: TableProps) => {
  const paymentStatus = 'clear';
  const headers = coach ? coachesTableHeader : kidsTableHeader;

  return (
    <div className="relative overflow-x-auto whitespace-nowrap">
      <table className="w-full text-xs md:text-sm 2xl:text:base text-left rtl:text-right text-[#232323]">
        <thead className="text-white bg-[#6E86C4]">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="px-6 py-3">
                {header}
              </th>
            ))}
            <th scope="col" className="px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="relative">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="h-[50dvh]">
                <Loader black />
              </td>
            </tr>
          ) : data?.length ? (
            data.map((data) => (
              <tr
                key={data?.id}
                className="bg-white border-b border-border hover:bg-gray-50"
              >
                <td className="px-6 py-1">
                  {data?.user?.photo_url ? (
                    <Image
                      src={data.user?.photo_url}
                      alt="kid"
                      height={50}
                      width={50}
                      className="size-10 rounded-full"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-smoke p-1">
                      <ProfileRound className="w-full h-auto" />
                    </div>
                  )}
                </td>
                <td className="px-6">{`${data?.user?.first_name} ${data?.user?.last_name}`}</td>
                <td className="px-6">
                  {coach
                    ? data?.user?.email
                    : calculateAge((data as IChild)?.dob)}
                </td>
                <td className="px-6">
                  {coach ? data?.user?.phone || 'N/A' : `Beginner`}
                </td>
                {!coach && (
                  <>
                    <td className="px-6">{formatDate(data?.created_at)}</td>
                    <td className="px-6">
                      <Select
                        classes={{
                          input: `max-w-[130px] !py-1 !rounded-full outline-none ${paymentStatus === 'clear' ? '!bg-[#D6ECD9] !text-[#319F43] !border-[#319F43]' : paymentStatus === 'refund' ? '!bg-[#E7E7E79E] !text-[#8D8D8D] !border-[#8D8D8D]' : '!bg-[#FF903533] !text-[#FF9035] !border-[#FF9035]'}`,
                        }}
                        options={paymentStatusOptions}
                        defaultValue={paymentStatus}
                      />
                    </td>
                  </>
                )}
                <td className="px-6 text-right text-black">
                  <button onClick={() => onEdit(data.id)}>
                    <Edit className="inline-block mr-5 w-5 h-auto" />
                  </button>
                  <button onClick={() => onDelete(data.id)}>
                    <Trash className="inline-block w-4 h-auto" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="h-[50dvh]">
                <Paragraph text="No record found" className="text-center" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
