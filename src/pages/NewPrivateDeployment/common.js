import privateSysSetting from 'src/api/privateSysSetting';
import React, { useState, useCallback } from 'react';
import iOSIcon from './images/ios.png';
import miIcon from './images/mi.png';
import huaweiIcon from './images/huawei.png';

export const updateSysSettings = (config, cb) => {
  privateSysSetting
    .editSysSettings({
      settings: config,
    })
    .then(result => {
      alert(_l('修改成功'), 1);
      cb && cb();
    });
};

export function useClientRect() {
  const [rect, setRect] = useState(null);
  const ref = useCallback(node => {
    if (node !== null) {
      setRect(node.getBoundingClientRect());
    }
  }, []);
  return [rect, ref];
}

export const LicenseVersions = [
  _l('社区版'),
  _l('标准版'),
  _l('专业版'),
  _l('大型企业版'),
  _l('教学版'),
  _l('专业版试用'),
];

export function RequestLabel(props) {
  const { title, className = '' } = props;

  return (
    <div className={`Font14 ${className}`}>
      <span className="Red mRight5">*</span>
      <span className="Gray">{title}</span>
    </div>
  );
}

export const ANDROID_APPS = [
  { name: _l('小米'), key: 'mi' },
  { name: _l('华为'), key: 'huawei' },
];

export const APP_PUSH_CONFIG = {
  ios: { icon: iOSIcon, name: _l('iOS'), value: 0, hasKey: '', ajax: 'setIosPushSetting' },
  mi: { icon: miIcon, name: _l('小米'), value: 1, hasKey: '', ajax: 'setMiPushSetting' },
  huawei: { icon: huaweiIcon, name: _l('华为'), value: 2, hasKey: '', ajax: 'setHuaweiPushSetting' },
};
