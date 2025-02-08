'use client';

import Text from '@/components/Text';
import clsx from 'clsx';
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useId,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { InputProps as InputNextProps } from '@nextui-org/react';
import { Input as InputNext } from '@nextui-org/react';
function getNestedError(errors: any, name: string): string | undefined {
  return name.split('.').reduce((acc, part) => acc && acc[part], errors)
    ?.message;
}

export interface InputProps extends Omit<InputNextProps, 'autoComplete'> {
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete'];
  label?: string;
  name: string;
  icons?: React.ReactNode;
  containerStyles?: string;
  error?: string;
  labelStyles?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  styleIcon?: string;
  rules?: any;
  isEndIcon?: boolean;
  isRemoveVietNameseTone?: boolean;
  isCurrency?: boolean;
  groupsRequired?: string[];
  isRequireMark?: boolean;
}

const Input = (
  {
    name,
    label,
    onChange,
    icons,
    value,
    error = '',
    rules = {},
    containerStyles,
    labelStyles,
    styleIcon,
    className,
    defaultValue,
    isEndIcon,
    isCurrency = false,
    isRemoveVietNameseTone = false,
    disabled,
    groupsRequired,
    isRequireMark = true,
    ...props
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) => {
  const formMethods = useFormContext();
  const generateId = useId();
  const id = props?.id || generateId;

  if (!formMethods) {
    throw new Error('Input component must be used within a Form Component');
  }

  const {
    unregister,
    register,
    setValue,
    formState: { errors },
  } = formMethods;
  useEffect(() => {
    setValue(name, value);
    return () => {
      unregister(name);
    };
  }, [value]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await register(name, rules).onChange(e);
    if (onChange) {
      onChange(e);
    }
  };

  const errorMessage = getNestedError(errors, name) || error;
  const { ref: registerRef, ...rest } = register(name, rules);
  return (
    <>
      <div className={clsx(containerStyles)}>
        {label && (
          <label
            htmlFor={id}
            className={clsx(
              labelStyles,
              'text-neutral-800 dark:text-neutral-200 text-sm font-semibold flex mt-3 mb-1',
            )}
          >
            <Text>{label}</Text>
            {rules?.required && isRequireMark && (
              <span className="text-red-500 font-normal w-2 h-2 flex items-center justify-center">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative w-full">
          <InputNext
            id={props?.id || id}
            {...(rest as unknown as InputNextProps)}
            onChange={handleChange}
            autoComplete="off"
            autoCorrect="off"
            ref={e => {
              registerRef(e);
              if (ref && 'current' in ref) {
                ref.current = e;
              }
            }}
            className="text-neutral-800 dark:text-neutral-200"
            placeholder={label}
            {...(props as InputNextProps)}
            disabled={disabled}
          />
          {icons && <div className={clsx('absolute', styleIcon)}>{icons}</div>}
        </div>
        {errorMessage && (
          <p className="text-red-500 text-xs mt-1">
            {errorMessage as ReactNode}
          </p>
        )}
      </div>
    </>
  );
};

export default forwardRef<HTMLInputElement, InputProps>(Input);
