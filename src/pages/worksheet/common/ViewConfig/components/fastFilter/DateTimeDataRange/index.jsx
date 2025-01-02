import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import RangeDialog from './RangeDialog';
import { DATE_TYPE } from '../config';

const Wrap = styled.div`
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  line-height: 24px;
  &:hover {
    background: #f5f5f5;
  }
`;
export default function DateTimeRange(props) {
  const { daterange } = props;
  const [{ show }, setState] = useSetState({
    show: false,
  });

  return (
    <React.Fragment>
      <div className="title">{_l('预设时间范围选项')}</div>
      <Wrap className="flexRow Hand mTop10" onClick={() => setState({ show: true })}>
        <div className="flex">
          {daterange.length <= 0 ? (
            <span className="Gray_75">{_l('请选择')}</span>
          ) : (
            daterange
              .map(o => {
                return (_.flattenDeep(DATE_TYPE).find(it => it.value == o) || {}).text;
              })
              .join('、')
          )}
        </div>
        <div className="editIcon">
          <i className="icon-hr_edit Gray_75 Hand Font16 ThemeHoverColor3"></i>
        </div>
      </Wrap>
      {show && <RangeDialog {...props} daterange={daterange} onClose={() => setState({ show: false })} />}
    </React.Fragment>
  );
}
