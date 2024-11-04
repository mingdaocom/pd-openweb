import moment from 'moment';
import { SYSTEM_CONTROLS } from 'src/pages/worksheet/constants/enum.js';

export const DEFAULT_COLORS = ['#12A0E7', '#FAA307', '#FF7043', '#02C39A', '#8D63D6'];
export const DATE_TIME_DATA_PARTICLE = [
  { text: _l('年'), value: 'CUR_YEAR', getTime: () => moment().year() },
  { text: _l('月'), value: 'CUR_MONTH', getTime: () => moment().format('YYYY-MM') },
  { text: _l('日'), value: 'TODAY', getTime: () => moment().format('YYYY-MM-DD') },
  { text: _l('时'), value: 'CUR_HOUR', getTime: () => moment().format('YYYY-MM-DD HH') },
  { text: _l('分'), value: 'CUR_MINUTE', getTime: () => moment().format('YYYY-MM-DD HH:mm') },
];
export const systemControls = SYSTEM_CONTROLS.filter(o => ['ownerid', 'caid', 'ctime'].includes(o.controlId));
