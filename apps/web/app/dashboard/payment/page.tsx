'use client';
import Button from 'components/ui/Button';
import Heading from 'components/ui/Heading';
import Loader from 'components/ui/Loader';
import Paragraph from 'components/ui/Paragraph';
import React from 'react';
import formatDate from 'utils/formatDate';

const Payment = () => {
  const headers = ['Date', 'Description', 'Amount', 'Status', 'Action'];
  const isLoading = false;
  const data = [
    { id: 1, updated_at: '2025-09-25', amount: '45.00', status: 'Paid' },
    { id: 2, updated_at: '2025-09-25', amount: '45.00', status: 'Paid' },
    { id: 3, updated_at: '2025-09-25', amount: '45.00', status: 'Paid' },
    { id: 4, updated_at: '2025-09-25', amount: '45.00', status: 'Paid' },
  ];

  return (
    <div className="px-3 md:px-5 py-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-between mb-5 2xl:mb-8">
        <div>
          <Heading text="Billing & Payment" small />
          <Paragraph text="Here are the clear, sortable list showing recent and upcoming payments." />
        </div>
        <Button
          text="Manage Billing Info"
          className="whitespace-nowrap w-fit"
        />
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto whitespace-nowrap bg-[#F0F3F9] p-3 rounded-lg">
        <table className="w-full text-xs md:text-sm 2xl:text:base text-left rtl:text-right text-[#232323] border-separate border-spacing-y-2">
          <thead className="font-Anton text-black text-base md:text-lg 2xl:text-xl">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-6 py-1 font-light">
                  {header}
                </th>
              ))}
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
                <tr key={data?.id} className="bg-white">
                  <td className="px-6 py-3 rounded-s-lg">
                    {formatDate(data.updated_at)}
                  </td>
                  <td className="px-6">Monthly Training Fee</td>
                  <td className="px-6">£{data.amount}</td>
                  <td className="px-6">{data.status}</td>
                  <td className="px-6 rounded-e-lg">
                    <button onClick={() => console.log('clicked')}>
                      View Invoice
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
    </div>
  );
};

export default Payment;
