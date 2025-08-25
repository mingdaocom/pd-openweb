import React, { Fragment } from 'react';
import { arrayOf, func, number, shape } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const Item = styled.div`
  padding: 8px 0;
  .icon-done {
    color: #1677ff;
  }
`;

export default function DateTimeList(props) {
  const { date, dateRange, onSelectOptionDate } = props;

  const renderItem = date => {
    return date.map((o, i) => (
      <Item className="flexRow valignWrapper pLeft15 pRight15 controlName" key={i}>
        <div
          key={o.value}
          className="flex ellipsis Font14"
          onClick={() => {
            onSelectOptionDate(o.value);
          }}
        >
          {o.text}
        </div>
        {dateRange === o.value && <Icon className="Font20" icon="done" />}
      </Item>
    ));
  };

  return (
    <div>
      {date.map((item, index) => (
        <Fragment key={index}>
          {renderItem(item)}
          {index !== date.length - 1 && (
            <div className="mTop10 mBottom10" style={{ borderTop: '1px solid #EAEAEA' }}></div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

DateTimeList.propTypes = {
  date: arrayOf(arrayOf(shape({}))),
  dateRange: number,
  onSelectOptionDate: func,
};
