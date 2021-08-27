import React, { useState, useEffect } from 'react';

import styled from 'styled-components';
import { isEmpty } from 'lodash';
const ViewEmptyWrap = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  &.empty {
    &:hover {
      color: #2196f3;
    }
  }
  .iconWrap {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.04);
    i {
      color: #9e9e9e;
      font-size: 70px;
    }
  }
  p {
    text-align: center;
    margin-top: 20px;
    color: #9e9e9e;
    font-size: 15px;
  }
`;

const STATUS_INFO = {
  empty: { text: _l('暂未添加记录'), icon: 'draft-box' },
  filter: { text: _l('没有符合条件的记录'), icon: 'draft-box' },
  search: { text: _l('没有搜索结果'), icon: 'search' },
};

export default function ViewEmpty(searchArgs) {
  const getStatus = () => {
    if (searchArgs.keyWords) return 'search';
    if (!isEmpty(searchArgs.filterControls)) return 'filter';
    return 'empty';
  };

  const status = getStatus();
  const { icon, text } = STATUS_INFO[status];

  return (
    <ViewEmptyWrap className={status}>
      <div className="iconWrap">
        <i className={`icon-${icon}`}></i>
      </div>
      <p>{text}</p>
    </ViewEmptyWrap>
  );
}
