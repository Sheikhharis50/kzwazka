'use client';
import { ContentType } from 'api/type';
import Input from 'components/ui/Input';
import Loader from 'components/ui/Loader';
import { useFileUpload } from 'hooks/useFileUpload';
import { useMessage } from 'hooks/useMessage';
import { useSearchParams } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Attachment, Send } from 'svgs';

const SendMessage = () => {
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');

  const { error, file, handleFileChange, setFile } = useFileUpload({
    maxSize: 1 * 1024 * 1024,
    validTypes: ['png', 'jpeg', 'jpg', 'pdf', 'docx'],
  });

  const { sendMessageMutation } = useMessage({
    group_id: groupId || undefined,
  });

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
            fileType === 'pdf' || fileType === 'docx'
              ? ContentType.DOCUMENT
              : ContentType.IMAGE,
          file: file,
          group_id,
        },
        { onSuccess: clearStates }
      );
    } else if (message) {
      sendMessageMutation.mutateAsync(
        {
          content_type: ContentType.TEXT,
          content: message,
          group_id,
        },
        { onSuccess: clearStates }
      );
    } else return;
  };

  useEffect(() => {
    if (error) toast(error, { type: 'error' });
  }, [error]);

  return (
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
  );
};

export default SendMessage;
