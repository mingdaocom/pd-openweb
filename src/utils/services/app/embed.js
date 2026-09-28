import { getContactInfo } from 'src/utils/services/project';

/** 读取嵌入链接动态参数对应的当前环境值。 */
export const getEmbedValue = (embedData = {}, id) => {
  switch (id) {
    case 'userId':
      return md.global.Account.accountId;
    case 'phone':
      return getContactInfo('mobilePhone');
    case 'email':
      return getContactInfo('email');
    case 'language':
      return window.getCurrentLang();
    case 'ua':
      return window.navigator.userAgent;
    case 'timestamp':
      return new Date().getTime();
    default:
      return embedData[id] || '';
  }
};
