import React from 'react';
import { modalZIndex } from 'constants/z-index';
import { Cross } from '@/svgs';
import Heading from '../Heading';
import Paragraph from '../Paragraph';
import Button from '../Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode | null;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Modal = ({
  isOpen = false,
  onClose,
  children = null,
  cancelText,
  confirmText,
  description,
  icon,
  onCancel,
  onConfirm,
  title,
  isLoading = false,
  size = 'sm',
}: ModalProps) => {
  const modalRef = React.useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  return (
    <div
      className={`absolute left-0 top-0 size-full bg-black/80 ${modalZIndex} justify-center items-center ${isOpen ? 'flex' : 'hidden'}`}
      onClick={handleClick}
    >
      <div
        ref={modalRef}
        className={`w-[95vw] ${size === 'sm' ? 'xs:w-sm sm:w-md' : size === 'md' ? 'xs:w-md sm:w-lg' : 'sm:w-xl'} max-h-11/12 bg-white rounded-2xl px-4 md:px-8 pt-3 pb-6 md:pb-10 md:pt-5 overflow-y-auto relative`}
      >
        <button
          className="sticky top-0 right-0 z-10 block ml-auto translate-x-1 md:translate-x-3"
          onClick={onClose}
        >
          <Cross className="w-4 md:w-5 h-auto" />
        </button>
        {children ? (
          children
        ) : (
          <div className="relative flex flex-col gap-5 md:gap-8 items-center text-center">
            {icon}
            <div>
              <Heading text={title || 'Confirmation'} small />
              {description && <Paragraph text={description} className="pt-1" />}
            </div>
            <div className="flex gap-3 w-full justify-center">
              <Button
                isLoading={isLoading}
                text={confirmText || 'Confirm'}
                onClick={onConfirm}
                className="min-w-[40%]"
              />
              <Button
                text={cancelText || 'Cancel'}
                className="!bg-smoke !text-black min-w-[40%]"
                onClick={onCancel}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
