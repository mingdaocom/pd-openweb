import { CONTROL_TYPE, DATE_TYPES, TIME_TYPES } from './config';

export const getControlType = data => {
  return CONTROL_TYPE[data.type];
};

export const getDateType = data => {
  return data.type === 16 ? TIME_TYPES : DATE_TYPES;
};
