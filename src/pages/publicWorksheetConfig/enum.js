import React from 'react';
import CoverActiveBg from './images/cover_active.png';
import CoverBg from './images/cover.png';
import TopActiveBg from './images/top_active.png';
import TopBg from './images/top.png';

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

export const FILLLIMIT_TYPE = {
  SPECIFIEDTIMES: 1,
  DAY: 2,
  WEEK: 3,
  MONTH: 4,
  YEAR: 5,
};

export const FFILLLIMIT_OPTIONS = [
  { text: _l('指定次数'), value: FILLLIMIT_TYPE.SPECIFIEDTIMES },
  { text: _l('每天'), value: FILLLIMIT_TYPE.DAY },
  { text: _l('每周'), value: FILLLIMIT_TYPE.WEEK },
  { text: _l('每月'), value: FILLLIMIT_TYPE.MONTH },
  { text: _l('每年'), value: FILLLIMIT_TYPE.YEAR },
];

export const PUBLISH_CONFIG_TABS = [
  { text: _l('链接设置'), value: 1 },
  { text: _l('微信增强'), value: 2 },
  { text: _l('来源参数'), value: 3 },
  { text: _l('嵌入HTML'), value: 4 },
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
    { text: _l('每月'), value: TIME_PERIOD_TYPE.MONTHLY },
    { text: _l('指定月份'), value: TIME_PERIOD_TYPE.SPECIFY_MONTH },
    { text: _l('指定范围'), value: TIME_PERIOD_TYPE.SPECIFY_RANGE_MONTH },
  ],
  day: [
    { text: _l('每天'), value: TIME_PERIOD_TYPE.DAILY },
    { text: _l('指定日期'), value: TIME_PERIOD_TYPE.SPECIFY_DAY },
    { text: _l('指定范围'), value: TIME_PERIOD_TYPE.SPECIFY_RANGE_DAY },
    { text: _l('每周'), value: TIME_PERIOD_TYPE.WEEKLY },
  ],
  hour: [
    { text: _l('不限'), value: TIME_PERIOD_TYPE.UNLIMITED },
    { text: _l('指定范围'), value: TIME_PERIOD_TYPE.SPECIFY_RANGE_HOUR },
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

export const MONTHS = [
  { text: _l('1月'), value: 1 },
  { text: _l('2月'), value: 2 },
  { text: _l('3月'), value: 3 },
  { text: _l('4月'), value: 4 },
  { text: _l('5月'), value: 5 },
  { text: _l('6月'), value: 6 },
  { text: _l('7月'), value: 7 },
  { text: _l('8月'), value: 8 },
  { text: _l('9月'), value: 9 },
  { text: _l('10月'), value: 10 },
  { text: _l('11月'), value: 11 },
  { text: _l('12月'), value: 12 },
];

export const NAV_NAME = {
  publicform: _l('公开表单'),
  query: _l('公开查询'),
  pay: _l('支付'),
};

export const SUBMIT_AFTER_OPTIONS = [
  { label: _l('显示回执'), value: 1 },
  { label: _l('跳转到指定链接'), value: 2 },
];

export const LAYOUT_OPTIONS = [
  {
    title: _l('显示为背景'),
    desc: _l('图片会被部分遮挡或裁切，适合作为背景的图片'),
    value: 1,
    bg: CoverBg,
    bgActive: CoverActiveBg,
  },
  {
    title: _l('显示在表单上方'),
    desc: _l('保持图片完整显示，适合包含文字内容的横幅图片'),
    value: 2,
    bg: TopBg,
    bgActive: TopActiveBg,
  },
];

export const WX_ICON_LIST = [
  'resources/public_wx_31372.png',
  'resources/public_wx_31370.png',
  'resources/public_wx_31371.png',
  'resources/public_wx_31369.png',
  'resources/public_wx_31373.png',
  'resources/public_wx_31374.png',
  'resources/public_wx_31375.png',
  'resources/public_wx_31376.png',
  'resources/public_wx_31377.png',
  'resources/public_wx_31378.png',
  'resources/public_wx_31379.png',
  'resources/public_wx_31380.png',
  'resources/public_wx_31381.png',
  'resources/public_wx_31382.png',
  'resources/public_wx_31383.png',
  'resources/public_wx_31384.png',
];
