import { useCallback, useEffect, useState } from 'react';
import { emitter } from 'src/utils/common';

export default function useListenedValue(key) {
  const [value, setValue] = useState();
  const handleCacheUpdate = useCallback(newValue => {
    setValue(newValue);
  }, []);
  useEffect(() => {
    emitter.addListener(key, handleCacheUpdate);
    return () => {
      emitter.removeListener(key, handleCacheUpdate);
    };
  }, []);
  return value;
}
