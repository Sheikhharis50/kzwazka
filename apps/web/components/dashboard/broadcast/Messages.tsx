'use client';
import { formatDate } from '@fullcalendar/core/index.js';
import { ContentType, IMessage } from 'api/type';
import Button from 'components/ui/Button';
import Paragraph from 'components/ui/Paragraph';
import ProfileIcon from 'components/ui/ProfileIcon';
import { useMessage } from 'hooks/useMessage';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import DownloadButton from 'components/ui/DownloadButton';
import { Arrow, Document } from 'svgs';

const Messages = () => {
  const [bottomVisible, setBottomVisibility] = useState<boolean | undefined>(
    false
  );
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');
  const scrollOnFirstMount = useRef<boolean>(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    getMessages: {
      data: messagesData,
      isLoading: messagesLoading,
      hasNextPage,
      fetchNextPage,
      isFetchedAfterMount,
    },
  } = useMessage({ group_id: groupId || undefined });

  const pages =
    messagesData?.pages.flatMap((page) => page.data).reverse() ?? [];

  const messages = pages.reduce(
    (acc, message) => {
      const date = formatDate(new Date(message.created_at), {
        dateStyle: 'short',
      });

      const existingDateGroup = acc.find((group) => group.date === date);

      if (existingDateGroup) {
        existingDateGroup.messages.push(message);
      } else {
        acc.push({
          date,
          messages: [message],
        });
      }

      return acc;
    },
    [] as Array<{ date: string; messages: IMessage[] }>
  );

  useEffect(() => {
    if (scrollOnFirstMount.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages]);

  useEffect(() => {
    const target = bottomRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setBottomVisibility(entry?.isIntersecting),
      { root: null, threshold: 0.1 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isFetchedAfterMount) scrollOnFirstMount.current = true;
  }, [isFetchedAfterMount]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden mb-16 md:mb-20 pt-5 md:pt-10 px-3 md:px-5">
      {hasNextPage && (
        <Button
          text="Load more"
          className="mx-auto mb-5"
          onClick={() => {
            scrollOnFirstMount.current = false;
            fetchNextPage();
          }}
          isLoading={messagesLoading}
        />
      )}
      {!messages?.length ? (
        <div className="flex items-center h-full w-full justify-center">
          <Paragraph text="No message foun." />
        </div>
      ) : (
        <div>
          {messages.map((record, index) => (
            <div key={`${record.date}-${index}`} className="mb-5 space-y-3">
              <p className="text-[9px] md:text-[14px] w-fit px-3 py-1 rounded-sm mx-auto bg-blue text-white mb-5 md:mb-8">
                {record.date}
              </p>
              {record.messages.map((message) => (
                <div key={message.id} className="flex gap-3 md:gap-5">
                  <div className="shrink-0">
                    <ProfileIcon photo_url={message?.created_by?.photo_url} />
                  </div>
                  <div className="relative bg-smoke p-3 md:p-5 mt-1 md:mt-2 max-w-full">
                    <div className="absolute size-3 md:size-4 -left-[8px] rotate-45 top-0.5 md:top-1 rounded-sm bg-smoke" />
                    {message.content_type === ContentType.IMAGE ? (
                      <div className="group relative">
                        <Image
                          src={message.content}
                          alt="iamge"
                          width={300}
                          height={400}
                          className="w-[140px] xs:w-[160px] md:w-[200px] h-auto object-cover bg-blue"
                        />
                        <DownloadButton url={message.content} />
                      </div>
                    ) : message.content_type === ContentType.TEXT ? (
                      <Paragraph
                        text={message.content}
                        className="pr-6 xs:pr-10 md:pr-14 break-all"
                      />
                    ) : message.content_type === ContentType.DOCUMENT ? (
                      <div className="rounded-lg bg-white pt-16 sm:pt-20 md:pt-24 w-[200px] sm:w-[250px] md:w-[300px] overflow-hidden relative group">
                        <div className="pl-1 sm:pl-2 md:pl-3 pr-8 py-2 bg-blue flex gap-1 md:gap-2 items-center text-white">
                          <Document className="shrink-0" />
                          <p className="text-[10px] md:text-xs break-all">
                            {' '}
                            {message.content.split('/').pop() || ''}
                          </p>
                        </div>
                        <DownloadButton url={message.content} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div id="bottom" ref={bottomRef} className="h-0.5" />
      <button
        className={`p-1 rounded-full border border-black fixed right-5 bottom-28 -rotate-90 ${bottomVisible ? 'hidden' : ''}`}
        onClick={() =>
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      >
        <Arrow />
      </button>
    </div>
  );
};

export default Messages;
