import React, { useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

const Con = styled.div`
  .refresh-try {
    font-size: 13px;
    color: #9e9e9e;
    .refreshCon {
      display: flex !important;
      margin-left: 8px;
    }
    .icon {
      font-size: 16px !important;
      color: #9e9e9e !important;
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
      color: #515151;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 28px;
      border: 1px solid #dbdbdb;
      &:hover {
        background: #f4f4f4;
      }
    }
  }
  &.is-recommend {
    padding-top: 12px;
    border-top: 1px solid #eaeaea;
  }
`;

const TRY_TRY_LIST = [
  {
    id: 1,
    text: _l('如何搭建应用'),
  },
  {
    id: 2,
    text: _l('如何创建自动化工作流'),
  },
  {
    id: 3,
    text: _l('创建工作流节点的上限是多少'),
  },
  {
    id: 4,
    text: _l('应用搭建的基本步骤有哪些'),
  },
  {
    id: 5,
    text: _l('如何设计工作表'),
  },
  { id: 6, text: _l('如何设置用户访问权限') },
  { id: 7, text: _l('如何实现扫码录入') },
  { id: 8, text: _l('如何将记录数据生成条码') },
  { id: 9, text: _l('如何配置工作流实现自动化') },
  { id: 10, text: _l('子表和关联记录的区别') },
  { id: 11, text: _l('如何创建自定义字段') },
  { id: 12, text: _l('如何根据条件控制字段显隐') },
  { id: 13, text: _l('外部门户可用来做什么') },
  { id: 14, text: _l('聚合表可以用来做什么') },
  { id: 15, text: _l('用户权限标签可以用来做什么') },
  { id: 16, text: _l('如何为应用添加外部链接') },
  { id: 17, text: _l('如何制作统计图表') },
  { id: 18, text: _l('如何对数据多维度分析') },
];

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
