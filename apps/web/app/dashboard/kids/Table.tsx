import React from 'react';
import Image from 'next/image';
import {
  kidsTableData,
  kidsTableHeader,
  paymentStatusOptions,
} from '@/constants/kids';
import Select from '@/components/Select';
import { Edit, Trash } from '@/svgs';

const KidsTable = () => {
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
        <tbody>
          {kidsTableData.map((data) => (
            <tr
              key={data.name}
              className="bg-white border-b border-border hover:bg-gray-50"
            >
              <td className="px-6 py-1">
                <Image
                  src={data.imageSrc}
                  alt="kid"
                  height={50}
                  width={50}
                  className="size-10 rounded-full"
                />
              </td>
              <td className="px-6">{data.name}</td>
              <td className="px-6">{data.age}</td>
              <td className="px-6">{data.skillLevel}</td>
              <td className="px-6">{data.joinedAt}</td>
              <td className="px-6">
                <Select
                  classes={{
                    input: `max-w-[130px] !py-1 !rounded-full outline-none ${data.paymentStatus === 'clear' ? '!bg-[#D6ECD9] !text-[#319F43] !border-[#319F43]' : data.paymentStatus === 'refund' ? '!bg-[#E7E7E79E] !text-[#8D8D8D] !border-[#8D8D8D]' : '!bg-[#FF903533] !text-[#FF9035] !border-[#FF9035]'}`,
                  }}
                  options={paymentStatusOptions}
                  defaultValue={data.paymentStatus}
                />
              </td>
              <td className="px-6 text-right">
                <Edit className="inline-block mr-5 text-black w-5 h-auto" />
                <Trash className="inline-block text-black w-4 h-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KidsTable;
