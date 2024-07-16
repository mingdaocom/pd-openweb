import moment from 'moment';
export const list = [
  {
    type: 'connect',
    txt: _l('API 库'),
    icon: 'connect',
  },
  {
    type: 'connectList',
    txt: _l('我的连接'),
    icon: 'workflow_webhook',
  },
  // {
  //   type: 'api',
  //   txt: _l('API'),
  //   icon: 'api',
  // },
];
export const dataIntegrationList = [
  {
    type: 'dataConnect',
    txt: _l('连接器'),
    icon: 'add_circle_outline',
  },
  {
    type: 'source',
    txt: _l('数据源'),
    icon: 'storage',
  },
  {
    type: 'task',
    txt: _l('同步任务'),
    icon: 'synchronization',
  },
  // {
  //   type: 'browser',
  //   txt: _l('数据浏览器'),
  //   icon: 'api',
  // },
];

export const integrationConfig = [...list, ...dataIntegrationList];

export const PageSize = 30;

export const CARD_TYE_LIST = [
  {
    typeId: 23,
    title: _l('输入参数'),
    des: _l('输入参数用于在工作表或工作流中使用 API 查询时，可以传入动态值'),
    icon: 'input',
    support: 'https://help.mingdao.com/integration/api#enter-parameters',
  },
  {
    typeId: 8,
    title: _l('API 请求参数'),
    des: _l('配置发送 API 请求时需要的 Query Param、Header、Body 等请求参数'),
    icon: 'tune',
    support: 'https://help.mingdao.com/integration/api#api-request',
  },
  {
    typeId: 21,
    title: _l('输出参数'),
    des: _l('在 API 查询时，可以将输出参数的值绑定到工作表字段或被工作流节点引用'),
    icon: 'output',
    support: 'https://help.mingdao.com/integration/api#output-parameters',
  },
];

export const TYPELIST = [
  { name: _l('Basic Auth 认证'), actionId: '521', appType: 31 },
  { name: _l('OAuth 2.0 认证（客户端凭证）'), actionId: '522', appType: 32 },
  { name: _l('API Key 或无需鉴权'), actionId: '520', appType: 30 },
];

export const TYPENODE = [
  { txt: _l('使用 Javascript 语言'), actionId: '102', typeId: 14, name: 'JavaScript' },
  { txt: _l('使用 Python 语言'), actionId: '103', typeId: 14, name: 'Python' },
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
export const formatDate = date => {
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

export const taskTabList = [
  {
    type: 'task',
    txt: _l('任务'),
  },
  {
    type: 'disposition',
    txt: _l('配置'),
  },
  {
    type: 'monitor',
    txt: _l('监控'),
  },
];
