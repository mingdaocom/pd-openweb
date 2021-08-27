import React, { useState, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { Score } from 'ming-ui';

const Line = styled.div`
  width: 100%;
  height: 1px;
  background-color: #f0f0f0;
`;

export default function ScoreDisplay({ data, onChange }) {
  const isStar = data.enumDefault === 1;
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
      <Score
        disabled
        defaultIcon="icon-task_custom_starred"
        score={+score}
        type={isStar ? 'star' : 'line'}
        count={isStar ? 5 : 10}
        backgroundColor="#bdbdbd"
      />
    </Fragment>
  );
}
