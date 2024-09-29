import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { browserIsMobile } from 'src/util';
import withoutRows from './assets/withoutRows.png';

const ViewEmptyWrap = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  &.empty {
    &:hover {
      color: #2196f3;
    }
  }
  .iconCon {
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

const MobileViewEmpty = styled.div`
  width: 100%;
  height: 100%;
`;

const STATUS_INFO = {
  empty: { text: _l('暂未添加记录'), icon: 'draft-box' },
  filter: { text: _l('没有符合条件的记录'), icon: 'draft-box' },
  search: { text: _l('没有搜索结果'), icon: 'search' },
};

export default function ViewEmpty({ filters = {}, viewFilter = [] }) {
  const getStatus = () => {
    if (filters.keyWords) return 'search';
    if (!isEmpty(filters.filterControls)) return 'filter';
    if (!isEmpty(viewFilter)) return 'filter';
    return 'empty';
  };

  const status = getStatus();
  const { icon, text } = STATUS_INFO[status];
  const isMobile = browserIsMobile();
  if (isMobile) {
    return (
      <MobileViewEmpty>
        <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
          <img className="img" src={withoutRows} />
          <div className="text mTop10">{_l('此视图下暂无记录')}</div>
        </div>
      </MobileViewEmpty>
    );
  }

  return (
    <ViewEmptyWrap className={status + ' flexColumn'}>
      <div className="iconCon">
        <i className={`icon-${icon}`}></i>
      </div>
      <p>{text}</p>
    </ViewEmptyWrap>
  );
}
