import Loader from '@/components/Loader';
import Paragraph from '@/components/Paragraph';
import Select from '@/components/Select';
import ProfileIcon from '@/components/ui/ProfileIcon';
import {
  attendanceOptions,
  attendanceTableHeaders,
} from '@/constants/attendance';
import { useQuery } from '@tanstack/react-query';
import * as api from 'api';
import React from 'react';
import calculateAge from 'utils/calculateAge';

const AttendanceTable = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => await api.attendance.getAll(),
  });

  return (
    <div className="relative overflow-x-auto whitespace-nowrap">
      <table className="w-full text-xs md:text-sm 2xl:text:base text-left rtl:text-right text-[#232323]">
        <thead className="text-white bg-[#6E86C4]">
          <tr>
            {attendanceTableHeaders.map((header) => (
              <th key={header} scope="col" className="px-6 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="h-[50dvh]">
                <Loader black />
              </td>
            </tr>
          ) : data?.data?.attendance?.length ? (
            data.data.attendance.map((record) => (
              <tr
                className="bg-white border-b border-border hover:bg-gray-50 py-1"
                key={record.children.id}
              >
                <td className="px-6 py-1">
                  <ProfileIcon photo_url={record.children.user.photo_url} />
                </td>
                <td className="px-6">
                  {`${record.children.user.first_name} ${record.children.user.last_name}`}
                </td>
                <td className="px-6">{calculateAge(record.children.dob)}</td>
                <td className="px-6">
                  <Select
                    classes={{
                      input: `max-w-[130px] !py-1 !rounded-full outline-none ${record.status === 'present' ? '!bg-[#D6ECD9] !text-[#319F43] !border-[#319F43]' : record.status === 'absent' ? '!bg-[#E7E7E79E] !text-[#8D8D8D] !border-[#8D8D8D]' : record.status === 'late' ? '!bg-[#FF903533] !text-[#FF9035] !border-[#FF9035]' : ''}`,
                    }}
                    options={attendanceOptions}
                    defaultValue={record.status || ''}
                  />
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

export default AttendanceTable;
