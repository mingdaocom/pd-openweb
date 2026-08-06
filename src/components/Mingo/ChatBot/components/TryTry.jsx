import React, { useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import { TRY_TRY_LIST } from './tryTryList';

const Con = styled.div`
  .refresh-try {
    font-size: 13px;
    color: var(--color-text-tertiary);
    .refreshCon {
      display: flex !important;
      margin-left: 8px;
    }
    .icon {
      font-size: 16px !important;
      color: var(--color-text-tertiary) !important;
      &:hover {
        color: var(--mingdao-primary-color) !important;
      }
    }
  }
  .try-try-list {
    gap: 6px;
    flex-wrap: wrap;
    margin: 6px 0 12px;
    .try-try-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 13px;
      color: var(--color-text-title);
      min-height: 28px;
      padding: 0 10px;
      border-radius: 28px;
      border: 1px solid var(--color-border-primary);
      &:hover {
        background: var(--color-background-hover);
      }
    }
  }
  &.is-recommend {
    padding-top: 12px;
    border-top: 1px solid var(--color-border-secondary);
  }
`;

function getTryTryList(oldIds = [], num = 3) {
  const newTryTryList = TRY_TRY_LIST.filter(item => !oldIds.includes(item.id));
  let result = [];

  while (result.length < num) {
    const randomIndex = Math.floor(Math.random() * newTryTryList.length);
    result.push(newTryTryList[randomIndex]);
    newTryTryList.splice(randomIndex, 1);
  }

  return result;
}

export default function TryTry({ data, className, onSelect = () => {}, onFocus = () => {} }) {
  const isRecommend = !!data;
  const [tryTryList, setTryTryList] = useState(data ? data.map(item => ({ text: item })) : getTryTryList());
  return (
    <Con className={cx(className, { 'is-recommend': isRecommend })}>
      <div className="refresh-try t-flex t-items-center">
        {isRecommend ? _l('猜你想问') : _l('试一试')}
        {!isRecommend && (
          <Tooltip title={_l('换一批')} placement="top">
            <span
              className="refreshCon t-items-center Hand"
              onMouseDown={() => {
                window.isTryRefreshClicked = true;
              }}
              onClick={() => {
                setTryTryList(getTryTryList(tryTryList.map(item => item.id)));
                onFocus();
              }}
            >
              <i className="icon icon-task-later"></i>
            </span>
          </Tooltip>
        )}
      </div>
      <div className="try-try-list t-flex">
        {tryTryList.map(item => (
          <div className="try-try-item" key={item.id} onClick={() => onSelect(item.text)}>
            {item.text}
          </div>
        ))}
      </div>
    </Con>
  );
}

TryTry.propTypes = {
  className: PropTypes.string,
  onSelect: PropTypes.func,
};
