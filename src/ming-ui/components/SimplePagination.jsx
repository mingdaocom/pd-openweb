import React, { useEffect, useState } from 'react';
import { func, number } from 'prop-types';
import { Input } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { isNaN } from 'lodash';

const Con = styled.div`
  display: flex;
  align-items: center;
  .next,
  .prev {
    width: 30px;
    height: 24px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #bdbdbd;
    border-radius: 3px;
    cursor: pointer;
    &:hover:not(.disabled) {
      color: #757575;
      background: #f5f5f5;
    }
    &.disabled {
      color: #bfbfbf;
      cursor: not-allowed;
    }
  }
  input {
    margin: 0 12px;
    padding: 0 10px;
    height: 24px !important;
    width: 44px !important;
    text-align: center;
    font-size: 13px !important;
    &:focus {
      border-color: #2196f3;
    }
  }
  .pageNumber {
    margin: 0 12px;
  }
`;

export default function SimplePagination(props) {
  const { count = 0, pageSize = 200, pageIndex = 1, onChange = () => {} } = props;
  const [tempPageIndex, setTempPageIndex] = useState(pageIndex);
  const pageNumber = Math.ceil(count / pageSize);
  const prevDisabled = tempPageIndex <= 1;
  const nextDisabled = tempPageIndex >= pageNumber;
  function changePageIndex(newPageIndex) {
    if (isNaN(newPageIndex)) {
      return;
    }
    if (newPageIndex > pageNumber) {
      newPageIndex = pageNumber;
    }
    if (newPageIndex < 1) {
      newPageIndex = 1;
    }
    onChange(newPageIndex);
    setTempPageIndex(newPageIndex);
  }
  useEffect(() => {
    setTempPageIndex(pageIndex);
  }, [pageIndex]);
  return (
    <Con>
      <span
        className={cx('prev', { disabled: prevDisabled })}
        onClick={() => {
          if (prevDisabled) return;
          changePageIndex(Number(tempPageIndex) - 1);
        }}
      >
        <i className="icon-arrow-left-border"></i>
      </span>
      <Input
        value={tempPageIndex}
        onChange={value => {
          setTempPageIndex(value.replace(/[^-\d]/g, ''));
        }}
        onBlur={() => {
          const num = Number(tempPageIndex);
          changePageIndex(num);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            const num = Number(tempPageIndex);
            changePageIndex(num);
          }
        }}
      />
      / <span className="pageNumber">{pageNumber}</span>
      <span
        className={cx('next', { disabled: nextDisabled })}
        onClick={() => {
          if (nextDisabled) return;
          changePageIndex(Number(tempPageIndex) + 1);
        }}
      >
        <i className="icon-arrow-right-border"></i>
      </span>
    </Con>
  );
}

SimplePagination.propTypes = {
  count: number,
  pageSize: number,
  pageIndex: number,
  onChange: func,
};
