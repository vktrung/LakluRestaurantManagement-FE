import { FormEvent, useRef } from 'react';
import _ from 'lodash';

interface UseThrottleSubmitOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Custom hook trả về 1 hàm throttle
 */
export function useThrottleSubmit({
  wait = 1000,
  leading = true,
  trailing = false,
}: UseThrottleSubmitOptions = {}) {
  // Tạo ref cho hàm throttle
  const throttledSubmit = useRef(
    _.throttle(
      (handleSubmit: (e: FormEvent) => void, e: FormEvent) => {
        handleSubmit(e);
      },
      wait,
      { leading, trailing },
    ),
  );

  // Trả về function để component gọi
  return throttledSubmit.current;
}
