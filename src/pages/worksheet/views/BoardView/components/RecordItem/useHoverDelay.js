import { useCallback, useRef } from 'react';

const useHoverDelay = ($ref, isDisabled = false, delay = 300) => {
  const timerRef = useRef(null);

  const onMouseEnter = useCallback(() => {
    if (isDisabled) return;

    timerRef.current = setTimeout(() => {
      if ($ref.current) {
        $($ref.current).find('.hoverShowAll').stop(true, true).slideDown(300);
      }
    }, delay);
  }, [isDisabled, delay, $ref]);

  const onMouseLeave = useCallback(() => {
    if (isDisabled) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if ($ref.current) {
      $($ref.current).find('.hoverShowAll').stop(true, true).slideUp(300);
    }
  }, [isDisabled, $ref]);

  return {
    hoverDelayEvents: {
      onMouseEnter,
      onMouseLeave,
    },
  };
};

export default useHoverDelay;
