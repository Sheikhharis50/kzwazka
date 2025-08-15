import React from 'react';
import Button from '@/components/Button';

interface DashboardCardProps {
  title: string;
  button?: { text: string; action: () => void };
  children: React.ReactNode;
}

const DashboardCard = ({ title, button, children }: DashboardCardProps) => {
  return (
    <div className="rounded-2xl bg-smoke overflow-hidden w-full">
      <div className="bg-blue h-[50px] flex justify-between items-center px-7">
        <h3 className="text-lg 2xl:text-[20px] text-white">{title}</h3>
        {button && (
          <Button
            text={button.text}
            onClick={button.action}
            className="text-[11px]!"
          />
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;
