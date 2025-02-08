'use client';

import {
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Modal as ModalNextUI,
  useDisclosure,
} from '@nextui-org/react';
import React from 'react';
import { IoPencil } from 'react-icons/io5';

interface ModalFormProps {
  nodeTrigger?: React.ReactNode;
  icon?: React.ReactNode;
  header?: React.ReactNode;
  children: ((onClose: () => void) => React.ReactNode) | React.ReactNode;
  isCloseBtn?: boolean;
  onSubmit?: () => void | Promise<void>;
  actionButtonText?: string;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
  isActionDisabled?: boolean;
  isAlwaysOpen?: boolean;
  cleanupFunction?: () => void;
  isClose?: boolean;
  [key: string]: any;
}

export const ModalForm: React.FC<ModalFormProps> = ({
  nodeTrigger,
  icon,
  header,
  children,
  isCloseBtn = true,
  onSubmit,
  actionButtonText,
  headerStyle,
  bodyStyle,
  footerStyle,
  isActionDisabled,
  cleanupFunction,
  isAlwaysOpen = false,
  ...props
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleAction = async (onClose: () => void) => {
    if (onSubmit) {
      try {
        await onSubmit();
      } catch (error) {
        console.error('Error in onSubmit:', error);
      }
    }
    onClose();
  };

  React.useEffect(() => {
    const modalWrapper = document.querySelector('.custom-modal-wrapper');
    const handleClick = (e: Event) => {
      e.stopPropagation();
    };

    if (modalWrapper) {
      modalWrapper.addEventListener('click', handleClick);
    }

    if (cleanupFunction) {
      cleanupFunction();
    }

    return () => {
      if (modalWrapper) {
        modalWrapper.removeEventListener('click', handleClick);
      }
    };
  }, [isOpen]);

  return (
    <>
      {icon && (
        <Button
          isIconOnly
          variant="bordered"
          radius="full"
          size="sm"
          aria-label={props['aria-label'] || 'Open modal'}
          onPress={onOpen}
        >
          {icon}
        </Button>
      )}
      {nodeTrigger &&
        React.isValidElement(nodeTrigger) &&
        React.cloneElement(nodeTrigger as React.ReactElement, {
          onPress: onOpen,
        })}
      <ModalNextUI
        isOpen={isAlwaysOpen || isOpen}
        onOpenChange={(open: boolean) => {
          onOpenChange();
        }}
        onClick={e => {
          e.stopPropagation();
        }}
        classNames={{
          wrapper: 'custom-modal-wrapper',
        }}
        {...props}
      >
        <ModalContent>
          {onClose => (
            <>
              {header && (
                <ModalHeader style={headerStyle}>{header}</ModalHeader>
              )}
              <ModalBody style={bodyStyle}>
                {' '}
                {typeof children === 'function' ? children(onClose) : children}
              </ModalBody>
              {!isActionDisabled && (
                <ModalFooter style={footerStyle}>
                  {isCloseBtn && (
                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>
                  )}
                  {actionButtonText && (
                    <Button
                      color="primary"
                      onPress={() => handleAction(onClose)}
                    >
                      {actionButtonText}
                    </Button>
                  )}
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </ModalNextUI>
    </>
  );
};
