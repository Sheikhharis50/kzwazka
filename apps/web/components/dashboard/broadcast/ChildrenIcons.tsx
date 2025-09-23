import { IChild } from 'api/type';
import ProfileIcon from 'components/ui/ProfileIcon';
import React from 'react';

interface ChildrenIconsProps {
  data: IChild[];
  isLoading: boolean;
  count: number;
}

const ChildrenIcons = ({
  data,
  isLoading = false,
  count,
}: ChildrenIconsProps) => {
  if (isLoading)
    return (
      <div className="flex">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="size-7 md:size-10 bg-border animate-pulse rounded-full"
            style={{ transform: `translateX(${(5 - index) * 12}px)` }}
          />
        ))}
      </div>
    );
  if (!data.length) return null;

  return (
    <div className="flex relative">
      {data.slice(0, 6).map((child, index) => {
        const showText = count > 6 && index === 5;
        return (
          <div
            key={child.id}
            className={`rounded-full border border-white ${showText ? 'relative overflow-hidden' : ''}`}
            style={{ transform: `translateX(${(5 - index) * 12}px)` }}
          >
            <ProfileIcon photo_url={child.user.photo_url} />
            {showText && (
              <div className="absolute bg-black/40 size-full flex items-center justify-center left-0 top-0 text-center">
                <p className="text-[7px] md:text-[9px] text-white">
                  {count - 6} <br />
                  others
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChildrenIcons;
