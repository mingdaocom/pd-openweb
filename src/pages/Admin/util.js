import { saveAs } from 'file-saver';

export const downloadFile = ({ url, params, exportFileName, callback = () => {} } = {}) => {
  window
    .mdyAPI('', '', params, {
      ajaxOptions: {
        url,
        responseType: 'blob',
      },
      customParseResponse: true,
    })
    .then(blob => {
      if (blob.type.includes('application/json')) {
        const reader = new FileReader();
        reader.readAsText(blob, 'utf-8');
        reader.onload = function () {
          const { exception } = JSON.parse(reader.result);
          alert(exception, 2);
        };
      } else {
        callback();
        saveAs(blob, exportFileName);
      }
    });
};

// 平台类型与系统设置的映射
const PLATFORM_HIDE_MAP = {
  microsoft: 'hideMicrosoftEntra',
  workwx: 'hideWorkWeixin',
  ding: 'hideDingding',
  feishu: 'hideFeishu',
  lark: 'hideLark',
  welink: 'hideWelink',
};

//判断指定平台是否被隐藏
export const isPlatformHidden = platformType => {
  const settingKey = PLATFORM_HIDE_MAP[platformType];
  if (!settingKey) return false;
  return !!md.global.SysSettings[settingKey];
};

//判断所有平台是否都被隐藏
export const allPlatformsHidden = () => {
  return (
    isPlatformHidden('microsoft') &&
    isPlatformHidden('workwx') &&
    isPlatformHidden('ding') &&
    isPlatformHidden('feishu') &&
    isPlatformHidden('lark') &&
    isPlatformHidden('welink')
  );
};
