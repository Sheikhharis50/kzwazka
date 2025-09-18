import Loader from '@/components/ui/Loader';
import Paragraph from '@/components/ui/Paragraph';
import Select from '@/components/ui/Select';
import ProfileIcon from '@/components/ui/ProfileIcon';
import {
  attendanceOptions,
  attendanceTableHeaders,
} from 'constants/attendance';
import { IAttendance } from 'api/type';
import React, { useState, useCallback, useMemo } from 'react';
import calculateAge from 'utils/calculateAge';

interface AttendanceTableProps {
  data?: IAttendance[];
  isLoading: boolean;
  handleStatusChange: ({
    childId,
    groupId,
    status,
    onError,
    onSuccess,
  }: {
    childId: number;
    groupId: number;
    status: string;
    onError: () => void;
    onSuccess: () => void;
  }) => void;
}

const AttendanceTable = ({
  data,
  isLoading,
  handleStatusChange,
}: AttendanceTableProps) => {
  const [localStatusUpdates, setLocalStatusUpdates] = useState<
    Record<number, string>
  >({});
  const [optimisticCache, setOptimisticCache] = useState<
    Record<number, string>
  >({});

  const getStatusClasses = useCallback((status: string) => {
    const baseClasses = 'min-w-26 max-w-26 !py-1 !rounded-full outline-none';

    switch (status) {
      case 'present':
        return `${baseClasses} !bg-[#D6ECD9] !text-[#319F43] !border-[#319F43]`;
      case 'absent':
        return `${baseClasses} !bg-[#E7E7E79E] !text-[#8D8D8D] !border-[#8D8D8D]`;
      case 'late':
        return `${baseClasses} !bg-[#FF903533] !text-[#FF9035] !border-[#FF9035]`;
      default:
        return baseClasses;
    }
  }, []);

  const handleRecordStatusChange = useCallback(
    (childId: number, groupId: number, newStatus: string) => {
      const backendStatus =
        data?.find((r) => r.id === childId)?.attendance?.status ?? '';
      setOptimisticCache((prev) => ({ ...prev, [childId]: backendStatus }));
      setLocalStatusUpdates((prev) => ({
        ...prev,
        [childId]: newStatus,
      }));

      handleStatusChange({
        childId,
        groupId,
        status: newStatus,
        onError: () => {
          setLocalStatusUpdates((prev) => ({
            ...prev,
            [childId]: optimisticCache[childId] ?? backendStatus,
          }));
        },
        onSuccess: () => {
          setOptimisticCache((prev) => {
            const copy = { ...prev };
            delete copy[childId];
            return copy;
          });
        },
      });
    },
    [data, handleStatusChange, optimisticCache]
  );

  const tableRows = useMemo(() => {
    if (!data?.length) return null;

    return data.map((record) => {
      const { dob, first_name, last_name, id, photo_url, attendance, group } =
        record;

      const currentStatus = attendance?.status ?? localStatusUpdates[id] ?? '';

      return (
        <tr
          className="bg-white border-b border-border hover:bg-gray-50 py-1"
          key={id}
        >
          <td className="px-6 py-1">
            <ProfileIcon photo_url={photo_url} />
          </td>
          <td className="px-6">{`${first_name} ${last_name}`}</td>
          <td className="px-6">{calculateAge(dob)}</td>
          <td className="px-6">
            <Select
              classes={{
                input: getStatusClasses(currentStatus),
              }}
              options={attendanceOptions}
              value={currentStatus}
              onChange={(e) =>
                handleRecordStatusChange(id, group.id, e.target.value)
              }
            />
          </td>
        </tr>
      );
    });
  }, [data, localStatusUpdates, getStatusClasses, handleRecordStatusChange]);

  return (
    <div className="relative overflow-x-auto whitespace-nowrap">
      <table className="w-full text-xs md:text-sm 2xl:text-base text-left rtl:text-right text-[#232323]">
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
              <td colSpan={attendanceTableHeaders.length} className="h-[50dvh]">
                <Loader black />
              </td>
            </tr>
          ) : data?.length ? (
            tableRows
          ) : (
            <tr>
              <td colSpan={attendanceTableHeaders.length} className="h-[50dvh]">
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
