export const list = [
  {
    type: 'connect',
    txt: _l('连接与认证'),
    icon: 'connect',
  },
  {
    type: 'api',
    txt: _l('API'),
    icon: 'api',
  },
];

export const PageSize = 30;

export const TYPELIST = [
  { name: _l('Basic Auth 认证'), actionId: '521', appType: 31 },
  { name: _l('OAuth 2.0 认证（客户端凭证）'), actionId: '522', appType: 32 },
  { name: _l('API Key 或无需鉴权'), actionId: '520', appType: 30 },
];

export const publishStatus2Text = {
  0: _l('创建'),
  1: _l('更新未发布'),
  2: _l('发布'),
  3: _l('关闭'),
};
/**
 * format 日期
 */
export const formatDate = (date) => {
  // 今天
  if (moment(date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
    return `${_l('今天')} ${moment(date).format('HH:mm')}`;
  }

  // 昨天
  if (new Date(moment().format('YYYY-MM-DD')) - new Date(moment(date).format('YYYY-MM-DD')) === 24 * 60 * 60 * 1000) {
    return `${_l('昨天')} ${moment(date).format('HH:mm')}`;
  }

  // 今年
  if (moment(date).format('YYYY') === moment().format('YYYY')) {
    return moment(date).format('MMMDo HH:mm');
  }

  return moment(date).format('YYYY-MM-DD HH:mm');
}

/**
 * 格式化参数
 */
export const formatParameters = (source, testMap) => {
  (source.match(/\$[^ \r\n]+?\$/g) || []).forEach(key => {
    source = source.replace(key, testMap[key] || '');
  });

  return source;
};

export const formatStr = str => {
  if (!str) return;
  let newStr;
  if (str.length === 5) {
    newStr = str.substr(0, 4) + '*';
  } else if (str.length > 5) {
    newStr = str.substr(0, 4) + '************' + str.substr(-4, 4);
  } else {
    newStr = str;
  }
  return newStr;
};
