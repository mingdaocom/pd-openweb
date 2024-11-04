import { useCallback, useEffect, useState } from 'react';
import { emitter } from 'worksheet/util';

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
