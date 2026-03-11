import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { DATE_TYPE } from '../config';
import RangeDialog from './RangeDialog';

const Wrap = styled.div`
  margin-top: 10px;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 4px;
  padding: 5px 10px;
  line-height: 24px;
  &:hover {
    background: var(--color-background-hover);
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
            <span className="textSecondary">{_l('请选择')}</span>
          ) : (
            daterange
              .map(o => {
                return (_.flattenDeep(DATE_TYPE).find(it => it.value == o) || {}).text;
              })
              .join('、')
          )}
        </div>
        <div className="editIcon">
          <i className="icon-hr_edit textSecondary Hand Font16 ThemeHoverColor3"></i>
        </div>
      </Wrap>
      {show && <RangeDialog {...props} daterange={daterange} onClose={() => setState({ show: false })} />}
    </React.Fragment>
  );
}
