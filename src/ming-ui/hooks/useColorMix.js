import { useCallback, useEffect, useRef } from 'react';
import { useComposeRef } from '@rc-component/util';
import { observeColorMix } from 'src/utils/platform/theme/colorMix';

export default function useColorMix(mixes, forwardedRef) {
  const elementRef = useRef(null);
  const cleanupRef = useRef();
  const setRef = useCallback(
    element => {
      cleanupRef.current?.();
      elementRef.current = element;
      cleanupRef.current = element ? observeColorMix(element, mixes) : undefined;
    },
    [mixes],
  );

  useEffect(() => {
    if (elementRef.current && !cleanupRef.current) {
      cleanupRef.current = observeColorMix(elementRef.current, mixes);
    }

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
    };
  }, [mixes]);

  return useComposeRef(setRef, forwardedRef);
}
