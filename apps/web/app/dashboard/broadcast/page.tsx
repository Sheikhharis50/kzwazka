'use client';
import ChildrenIcons from 'components/dashboard/broadcast/ChildrenIcons';
import GroupPills from 'components/ui/GroupPills';
import Heading from 'components/ui/Heading';
import Input from 'components/ui/Input';
import Loader from 'components/ui/Loader';
import { useChildren } from 'hooks/useChildren';
import { useFileUpload } from 'hooks/useFileUpload';
import { useMessage } from 'hooks/useMessage';
import { useSearchParams } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Attachment, Send } from 'svgs';

const Broadcast = () => {
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');

  const {
    getAllChildren: { data, isLoading },
  } = useChildren({ group_id: groupId || undefined });

  const { sendMessageMutation } = useMessage();

  const { error, file, handleFileChange, setFile } = useFileUpload({
    maxSize: 1 * 1024 * 1024,
    validTypes: ['png', 'jpeg', 'jpg', 'pdf', 'docx'],
  });

  console.log(file, message);

  useEffect(() => {
    if (error) toast(error, { type: 'error' });
  }, [error]);

  const clearStates = () => {
    setFile(undefined);
    setMessage('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const group_id = groupId ? parseInt(groupId) : undefined;
    if (file) {
      const fileType = file.name.split('.').pop() || '';
      sendMessageMutation.mutateAsync(
        {
          content_type:
            fileType === 'pdf' || fileType === 'docx' ? 'document' : 'image',
          file: file,
          group_id,
        },
        { onSuccess: clearStates }
      );
    } else if (message) {
      sendMessageMutation.mutateAsync(
        {
          content_type: 'text',
          content: message,
          group_id,
        },
        { onSuccess: clearStates }
      );
    } else return;
  };

  return (
    <div className="flex flex-col">
      <div className="my-5 space-y-3 md:space-y-4 px-3 md:px-5">
        <div className="flex justify-between items-center">
          <Heading text="Broadcast" small />
          <ChildrenIcons
            data={data?.data || []}
            isLoading={isLoading}
            count={data?.pagination.count || 0}
          />
        </div>
        <GroupPills all />
      </div>
      <hr className="border-border" />
      <div className="flex-1 overflow-y-auto"></div>
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full lg:w-[calc(100%-280px)]"
      >
        <div className="p-3 md:p-5 bg-smoke">
          <div className="relative">
            <Input
              placeholder="Send a message in broadcast..."
              classes={{ input: 'bg-white border-0 pr-20' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              readOnly={sendMessageMutation.isPending}
            />
            <div className="flex items-center gap-3 absolute right-0 top-0 h-full pr-3">
              <button className="relative" type="button">
                <Attachment className="w-4 md:w-6 h-auto" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,.pdf,.docx"
                  className="absolute size-full left-0 top-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={sendMessageMutation.isPending}
                />
              </button>
              <button type="submit" className="relative">
                {sendMessageMutation.isPending ? (
                  <Loader black />
                ) : (
                  <>
                    <Send className="text-red w-5 md:w-7 h-auto" />
                    {file && (
                      <p className="text-[8px] absolute -left-[15%] -top-[40%] size-3 rounded-full bg-blue text-white">
                        1
                      </p>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Broadcast;
