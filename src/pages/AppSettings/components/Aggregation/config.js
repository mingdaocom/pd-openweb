import moment from 'moment';
import { SYSTEM_CONTROLS } from 'src/pages/worksheet/constants/enum.js';

export const COLORS_LIST = [
  '#12A0E7',
  '#FAA307',
  '#FF7043',
  '#02C39A',
  '#8D63D6',
  '#BB702F',
  '#78909C',
  '#26C6DA',
  '#732ED1',
  '#455A65',
];
export const DEFAULT_COLORS = [...COLORS_LIST, ...COLORS_LIST,];
export const DATE_TIME_DATA_PARTICLE = [
  { text: _l('年'), value: 'CUR_YEAR', getTime: () => moment().year() },
  { text: _l('月'), value: 'CUR_MONTH', getTime: () => moment().format('YYYY-MM') },
  { text: _l('日'), value: 'TODAY', getTime: () => moment().format('YYYY-MM-DD') },
  { text: _l('时'), value: 'CUR_HOUR', getTime: () => moment().format('YYYY-MM-DD HH') },
  { text: _l('分'), value: 'CUR_MINUTE', getTime: () => moment().format('YYYY-MM-DD HH:mm') },
];
export const systemControls = SYSTEM_CONTROLS.filter(o => ['ownerid', 'caid', 'ctime'].includes(o.controlId));

//是否支持拆分
export const canArraySplit = (control) => {
  // 单选/多选、成员、部门、组织角色字段
  return [9, 10, 11, 26, 27, 48].includes(control.type)
}

//单选类型
export const isUnique = (control) => {
  return [9, 11,].includes(control.type) || ([26, 27, 48].includes(control.type) && control.enumDefault !== 1)
}

export const GROUPLIMITTYPES = [9, 10, 11, 26, 27, 48]

export const GROUPMAX = 8
