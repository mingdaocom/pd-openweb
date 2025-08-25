import React, { Fragment } from 'react';
import _ from 'lodash';
import { CustomScore } from 'ming-ui';

export default function ScoreDisplay({ data }) {
  let score = 0;
  const source = _.get(data, ['advancedSetting', 'defsource']);
  if (source) {
    try {
      const value = JSON.parse(source) || [];
      score = (value[0] || { staticValue: 0 }).staticValue;
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Fragment>
      <CustomScore disabled data={data} score={+score} />
    </Fragment>
  );
}
