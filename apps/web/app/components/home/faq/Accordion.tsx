'use client';

import Heading from '@/components/ui/Heading';
import Paragraph from '@/components/ui/Paragraph';
import { useState, useRef, useEffect } from 'react';

interface FAQ {
  title: string;
  description: string;
}

interface AccordionProps {
  faqs: FAQ[];
}

export default function Accordion({ faqs }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const newHeights = contentRefs.current.map((ref) => ref?.scrollHeight ?? 0);
    setHeights(newHeights);
  }, [faqs]);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full md:space-y-4 space-y-3">
      {faqs.map((faq, index) => (
        <div key={index} className="rounded-md overflow-hidden bg-white">
          <div
            className="flex gap-3 justify-between items-center w-full pl-2 sm:pl-3 md:pl-6 pr-1 md:pr-2 md:py-2 py-1 text-start cursor-pointer"
            onClick={() => toggleAccordion(index)}
          >
            <Heading
              xs
              className="text-sm xs:text-base flex-1"
              text={faq.title}
            />
            <div className="text-lg md:text-2xl xl:text-3xl md:size-14 sm:size-12 xs:size-10 size-8 rounded-full bg-[#005AC0] flex items-center justify-center text-white">
              {openIndex === index ? <p>-</p> : <p>+</p>}
            </div>
          </div>
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: openIndex === index ? heights[index] : 0 }}
          >
            <hr className="border-border mx-3 md:mx-5" />
            <div
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="pl-2 sm:pl-3 md:pl-6 md:pr-[60px] sm:pr-[50px] xs:pr-[42px] pr-[35px] py-3 md:py-5"
            >
              <Paragraph text={faq.description} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
