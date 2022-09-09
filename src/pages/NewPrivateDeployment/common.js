import privateSysSetting from 'src/api/privateSysSetting';
import { useState, useCallback } from 'react';

export const updateSysSettings = (config, cb) => {
  privateSysSetting.editSysSettings({
    settings: config
  }).then(result => {
    alert(_l('修改成功'), 1);
    cb && cb();
  });
}

export function useClientRect() {
  const [rect, setRect] = useState(null);
  const ref = useCallback(node => {
    if (node !== null) {
      setRect(node.getBoundingClientRect());
    }
  }, []);
  return [rect, ref];
}
