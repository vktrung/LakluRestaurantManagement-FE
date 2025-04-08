'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(isAlwaysOpen);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleAction = async () => {
    if (onSubmit) {
      try {
        await onSubmit();
      } catch (error) {
        console.error('Error in onSubmit:', error);
      }
    }
    handleClose();
  };

  React.useEffect(() => {
    if (cleanupFunction && !isOpen) {
      cleanupFunction();
    }
  }, [isOpen, cleanupFunction]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {icon && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label={props['aria-label'] || 'Open modal'}
            onClick={handleOpen}
          >
            {icon}
          </Button>
        </DialogTrigger>
      )}
      
      {nodeTrigger && (
        <DialogTrigger asChild>
          {React.isValidElement(nodeTrigger) &&
            React.cloneElement(nodeTrigger as React.ReactElement, {
              onClick: handleOpen,
            })}
        </DialogTrigger>
      )}
      
      <DialogContent 
        className="sm:max-w-md" 
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {header && (
          <DialogHeader style={headerStyle}>
            <DialogTitle>{header}</DialogTitle>
          </DialogHeader>
        )}
        
        <div style={bodyStyle} className="py-4">
          {typeof children === 'function' ? children(handleClose) : children}
        </div>
        
        {!isActionDisabled && (
          <DialogFooter style={footerStyle}>
            {isCloseBtn && (
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            )}
            {actionButtonText && (
              <Button onClick={handleAction}>
                {actionButtonText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
