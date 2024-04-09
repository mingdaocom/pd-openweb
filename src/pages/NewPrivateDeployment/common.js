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

export const LicenseVersions = [_l('社区版'), _l('标准版'), _l('专业版'), _l('大型企业版'), _l('教学版'), _l('专业版试用')];