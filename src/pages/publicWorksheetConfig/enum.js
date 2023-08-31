import React from 'react';

export const themes = [
  { main: '#E91E63', second: '#FEF3F7' },
  { main: '#FF9800', second: '#FFFAF2' },
  { main: '#4CAF50', second: '#F6FBF6' },
  { main: '#00BCD4', second: '#F2FCFD' },
  { main: '#2196F3', second: '#F3FAFF' },
  { main: '#9C26AF', second: '#FAF4FB' },
  { main: '#3F51B5', second: '#F5F6FB' },
  { main: '#455A64', second: '#F5F6F7' },
];

export const coverurls = [
  'pic/201911/08/MQzRHVXzPmcCBgV_396796455.png',
  'pic/201911/08/jNpvhIgQYvHUFqL_398643497.png',
  'pic/201911/08/kOqUtjdKWQOZbTy_1242191847.png',
  'pic/201911/08/MOqzfSLZOTymdtC_1240344805.png',
  'pic/201911/08/NBuhVCObmXupIBa_1239421284.png',
  'pic/201911/08/nQKTpALBwIxJVJw_2082969634.png',
  'pic/201911/08/aLkrPFSqFJYaHPt_2082046113.png',
  'pic/201911/08/YaYzwTVjZrzGIkI_2081122592.png',
  'pic/201911/08/ZGGpjQWCpFdTEyK_816256247.png',
  'pic/201911/08/qzxIeTTRVfHHGKb_2210772957.png',
  'pic/201911/08/EbgHDXFADAHjQum_2211696478.png',
  'pic/201911/08/yZTyrCwrznVgmvb_1368148128.png',
  'pic/201911/08/hycRfyYckIEeMuc_1369071649.png',
  'pic/201911/08/WcoVCHAeYGuSHXZ_1369995170.png',
  'pic/201911/08/WiaGmlqayOJuIfI_526446820.png',
  'pic/201911/08/vpgtZxphzBsvgHC_527370341.png',
  'pic/201911/08/pfdgTplZpgnbMts_528293862.png',
  'pic/201911/08/tEvdSDMjMkKlcTJ_315254488.png',
  'pic/201911/08/IhyECXjRlXCfOCt_314330967.png',
  'pic/201911/08/GvnUCQbvTdShGKS_294013505.png',
  'pic/201911/08/zVyIZTFdmTYPWce_293089984.png',
  'pic/201911/08/gGOzgtsAoWJlOPH_3158328962.png',
  'pic/201911/08/PLviGPtNpjQuCRw_3159252483.png',
];

export const VISIBLE_TYPE = {
  CLOSE: 1,
  PUBLIC: 2,
  NO_PERMISSSION: 4,
};

export const FILL_TIMES = {
  ONETIME: 1,
  DAILY: 2,
  UNLIMITED: 3,
};

export const PUBLISH_CONFIG_TABS = [
  { text: _l('链接设置'), value: 1 },
  { text: _l('来源参数'), value: 2 },
  { text: _l('嵌入HTML'), value: 3 },
];

export const FILL_TIMES_OPTIONS = [
  { text: _l('仅一次'), value: FILL_TIMES.ONETIME },
  { text: _l('每天一次'), value: FILL_TIMES.DAILY },
];

export const FILL_OBJECT = {
  ALL: 1,
  PLATFORM: 2,
  ORGANIZATION: 3,
};

export const FILL_OBJECT_OPTIONS = [
  { text: _l('所有人'), value: FILL_OBJECT.ALL },
  { text: _l('平台用户'), value: FILL_OBJECT.PLATFORM },
  { text: _l('本组织用户'), value: FILL_OBJECT.ORGANIZATION },
];

export const TIME_TYPE = {
  MONTH: 'month',
  DAY: 'day',
  HOUR: 'hour',
};

export const TIME_PERIOD_TYPE = {
  MONTHLY: 1,
  SPECIFY_MONTH: 2,
  SPECIFY_RANGE_MONTH: 3,
  DAILY: 1,
  SPECIFY_DAY: 2,
  SPECIFY_RANGE_DAY: 3,
  WEEKLY: 4,
  UNLIMITED: 1,
  SPECIFY_RANGE_HOUR: 2,
};

export const TIME_PERIOD_OPTIONS = {
  month: [
    { text: '每月', value: TIME_PERIOD_TYPE.MONTHLY },
    { text: '指定月份', value: TIME_PERIOD_TYPE.SPECIFY_MONTH },
    { text: '指定范围', value: TIME_PERIOD_TYPE.SPECIFY_RANGE_MONTH },
  ],
  day: [
    { text: '每天', value: TIME_PERIOD_TYPE.DAILY },
    { text: '指定日期', value: TIME_PERIOD_TYPE.SPECIFY_DAY },
    { text: '指定范围', value: TIME_PERIOD_TYPE.SPECIFY_RANGE_DAY },
    { text: '每周', value: TIME_PERIOD_TYPE.WEEKLY },
  ],
  hour: [
    { text: '不限', value: TIME_PERIOD_TYPE.UNLIMITED },
    { text: '指定范围', value: TIME_PERIOD_TYPE.SPECIFY_RANGE_HOUR },
  ],
};

export const COLLECT_WAY_OPTIONS = [
  // { text: _l('平台官方微信服务号'), value: 1 },
  { text: _l('组织的微信认证服务号'), value: 2 },
];

export const AUTH_OPTIONS = [
  { text: _l('无需授权,静默获取'), value: false },
  { text: _l('需授权,用户允许后获取'), value: true },
];

export const ALLOW_EDIT_TYPES = [
  { text: _l('仅查看'), value: 1 },
  { text: _l('允许修改'), value: 2 },
];

export const WEEKS = [
  { text: _l('周一'), value: 1 },
  { text: _l('周二'), value: 2 },
  { text: _l('周三'), value: 3 },
  { text: _l('周四'), value: 4 },
  { text: _l('周五'), value: 5 },
  { text: _l('周六'), value: 6 },
  { text: _l('周日'), value: 0 },
];

export const WECHAT_FIELD_KEY = {
  OPEN_ID: 'openId',
  NICK_NAME: 'nickName',
  HEAD_IMG_URL: 'headImgUrl',
};

export const WECHAT_MAPPING_SOURCE_FIELDS = [
  { key: WECHAT_FIELD_KEY.OPEN_ID, name: _l('微信OpenID'), required: true },
  { key: WECHAT_FIELD_KEY.NICK_NAME, name: _l('微信昵称') },
  { key: WECHAT_FIELD_KEY.HEAD_IMG_URL, name: _l('微信头像') },
];
