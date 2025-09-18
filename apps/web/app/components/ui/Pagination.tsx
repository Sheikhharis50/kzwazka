'use client';
import { Arrow } from '@/svgs';
import React from 'react';
import PaginationReact from 'react-paginate';
import Paragraph from '../Paragraph';
import { useRouter } from 'next/navigation';
import { useQueryString } from '@/hooks/useQueryString';

interface PaginationProps {
  pageCount: number;
  classes?: { root?: string };
}

const Pagination = ({ pageCount, classes = {} }: PaginationProps) => {
  const router = useRouter();
  const { createQueryString } = useQueryString();
  const { root = '' } = classes;
  return pageCount > 1 ? (
    <PaginationReact
      pageCount={pageCount || 0}
      className={`fixed bottom-0 w-full lg:w-[calc(100%-300px)] flex justify-center items-center gap-1 pb-3 md:pb-1.5 text-gray-500 ${root}`}
      previousLabel={
        <div className="flex items-center gap-2 px-3 md:px-5 py-1.5 border border-border rounded-lg text-black cursor-pointer mr-1 md:mr-4">
          <Arrow />
          <Paragraph text="Previous" className="hidden md:block" />
        </div>
      }
      nextLabel={
        <div className="flex items-center gap-2 px-3 md:px-5 py-1.5 border border-border rounded-lg text-black cursor-pointer ml-1 md:ml-4">
          <Paragraph text="Next" className="hidden md:block" />
          <Arrow className="-scale-x-100" />
        </div>
      }
      activeClassName="rounded-md bg-yellow text-black py-1 md:py-1.5"
      pageLinkClassName="cursor-pointer px-2 md:px-[15px]"
      pageRangeDisplayed={1}
      marginPagesDisplayed={2}
      breakLabel="..."
      renderOnZeroPageCount={null}
      onPageChange={(page) =>
        router.push(`?${createQueryString('page', `${page.selected + 1}`)}`)
      }
    />
  ) : null;
};

export default Pagination;
