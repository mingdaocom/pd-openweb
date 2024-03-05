import React, { Fragment } from 'react';
import _ from 'lodash';
import { ShowFormat } from './DateConfig';
import WeekdaySetting from '../components/WeekdaySetting';

export default function FormulaDateConfig(props) {
  const { data } = props;
  const { enumDefault, unit } = data;

  if (enumDefault === 2) {
    return <Fragment>{_.includes(['1', '3'], unit) && <ShowFormat {...props} />}</Fragment>;
  }

  return <WeekdaySetting {...props} />;
}
