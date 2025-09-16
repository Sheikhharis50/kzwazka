'use client';
import { Previous } from '@/svgs';
import { ISession } from 'api/type';
import React, { useState } from 'react';
import { formatTo12Hour } from 'utils/formatDate';

const SessionsAccordion = ({ sessions }: { sessions: ISession[] }) => {
  const [active, setActive] = useState(false);
  const isMultipleSessions = sessions.length > 1;
  const session1 = `${sessions[0]?.day.slice(0, 3)}, ${formatTo12Hour(sessions[0]?.start_time || '')} - ${formatTo12Hour(sessions[0]?.end_time || '')}`;

  return (
    <div className="relative">
      <div
        className="flex justify-between items-center gap-2 cursor-pointer"
        onClick={() => (isMultipleSessions ? setActive(!active) : undefined)}
      >
        <p className="flex-1 truncate" title={session1}>
          {session1}
        </p>
        {isMultipleSessions && <Previous className="-rotate-90 w-2 h-auto" />}
      </div>
      <div
        className={`absolute bg-white w-full rounded-md transition-all space-y-1 ${active ? 'max-h-[100px] overflow-y-auto p-2 opacity-100' : 'overflow-hidden max-h-0 opacity-0'}`}
      >
        {isMultipleSessions &&
          sessions.map((session) => {
            const sessString = `${session.day.slice(0, 3)}, ${formatTo12Hour(session.start_time)} - ${formatTo12Hour(session.end_time)}`;
            return (
              <p
                key={session.id}
                title={sessString}
                className="truncate font-normal"
              >
                {sessString}
              </p>
            );
          })}
      </div>
    </div>
  );
};

export default SessionsAccordion;
