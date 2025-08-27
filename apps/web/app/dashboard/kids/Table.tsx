import React from 'react';
import Image from 'next/image';
import { kidsTableHeader, paymentStatusOptions } from '@/constants/kids';
import Select from '@/components/Select';
import { Edit, ProfileRound, Trash } from '@/svgs';
import Loader from '@/components/Loader';
import calculateAge from 'utils/calculateAge';
import formatDate from 'utils/formatDate';
import { IChild } from 'api/type';

interface KidsTableProps {
  data: IChild[] | undefined;
  isLoading: boolean;
}

const KidsTable = ({ data, isLoading }: KidsTableProps) => {
  const paymentStatus = 'clear';

  return (
    <div className="relative overflow-x-auto whitespace-nowrap">
      <table className="w-full text-xs md:text-sm 2xl:text:base text-left rtl:text-right text-[#232323]">
        <thead className="text-white bg-[#6E86C4]">
          <tr>
            {kidsTableHeader.map((header) => (
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
                <td className="px-6">{calculateAge(data?.dob)}</td>
                <td className="px-6">{`Beginner`}</td>
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
                <td className="px-6 text-right">
                  <Edit className="inline-block mr-5 text-black w-5 h-auto" />
                  <Trash className="inline-block text-black w-4 h-auto" />
                </td>
              </tr>
            ))
          ) : (
            'No data found'
          )}
        </tbody>
      </table>
    </div>
  );
};

export default KidsTable;
