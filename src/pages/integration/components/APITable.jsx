import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv, Checkbox } from 'ming-ui';

const Wrap = styled.div(
  ({ maxHeight, minHeight }) => `
  height: 100%;
  .tableCon {
    height: 100%;
  }
  .headTr,
  .conTr {
    margin: 0;
    p {
      margin: 0;
    }
    align-items: center;
    padding: 13px 0;
    border-bottom: 1px solid rgba(224, 224, 224, 1);
    display: flex;
    & > div.checkCon{
      max-width: 35px;
    }
    & > div {
      flex: 1;
      word-break: break-word;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .name {
      flex: 2;
      word-break: break-word;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .explain {
      flex: 4;
      word-break: break-word;
      padding-right: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .headTr {
    color: #757575;
  }
  .lisCon {
    overflow: auto;
    max-height: ${maxHeight}px;
    min-height: ${minHeight}px;
  }
  .conTr {
    &:hover {
      background: rgba(245, 245, 245, 1);
    }
  }
  .noData {
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #f5f5f5;
      border-radius: 50%;
      margin: 0 auto;
      color: #9e9e9e;
    }
  }
  .Green_fr{
    color:#4caf50
  }
`,
);
// 滚动分页加载，每页30个，排序为添加时间倒序；
// 组织内的所有连接都显示，只有超级管理员和拥有者可以点击查看连接详情；
const keysDef = [
  {
    key: 'checkCon',
    render: (item, selectedList, handleSelect, isCheckAll) => {
      return (
        <Checkbox
          className="mLeft5"
          size="small"
          checked={selectedList.includes(item.id) || isCheckAll}
          // onClick={() => handleSelect(item.id)}
        />
      );
    },
  },
  {
    key: 'name',
    name: _l('API 名称'),
  },
  {
    key: 'explain',
    name: _l('描述'),
    render: item => {
      return (
        <span className="" title={item.explain}>
          {item.explain}
        </span>
      );
    },
  },
  {
    key: 'price',
    name: _l('服务价格'),
    render: item => {
      const { price } = item;
      return <span className="Green_fr">{price && price > 0 ? `¥ ${price}/次` : _l('免费')}</span>;
    },
  },
];
function APITable(props) {
  const WrapRef = useRef();
  const WrapBotttomRef = useRef();
  const { list = [], onChange, selectedList, noDataIcon } = props;
  const keys = props.keys || keysDef;
  const handleSelect = id => {
    onChange(selectedList.includes(id) ? selectedList.filter(o => o !== id) : selectedList.concat(id));
  };
  useEffect(() => {
    window.addEventListener('scroll', HandleScroll, true);
  }, []);
  const HandleScroll = e => {
    if (!WrapRef.current || !WrapBotttomRef.current) return;
    if (Math.abs($(WrapRef.current).offset().top - $(WrapBotttomRef.current).offset().top) <= 10) {
      props.onScrollEnd && props.onScrollEnd();
    }
  };
  return (
    <Wrap maxHeight={props.maxHeight} minHeight={props.minHeight}>
      <div className="tableCon flexColumn flex">
        <div className="headTr">
          {keys.map((o, i) => {
            return (
              <div className={`${o.key}`} key={i}>
                {i === 0 ? (
                  <Checkbox
                    size="small"
                    className="mLeft5"
                    clearselected={selectedList.length < props.count && selectedList.length > 0 && !props.isCheckAll}
                    checked={
                      ((selectedList.length >= props.count && props.count > 0) || props.isCheckAll) && list.length > 0
                    }
                    onClick={checked => props.onCheck(!checked)}
                  />
                ) : (
                  o.name
                )}
              </div>
            );
          })}
        </div>
        <div className="flex lisCon">
          {props.count > 0 || props.list > 0 ? (
            <React.Fragment>
              {list.map(item => {
                return (
                  <div
                    className="conTr Hand"
                    key={item.id}
                    onClick={() => {
                      handleSelect(item.id);
                    }}
                  >
                    {keys.map(o => {
                      return (
                        <div className={`${o.key}`}>
                          {o.render ? o.render(item, selectedList, handleSelect, props.isCheckAll) : item[o.key]}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {props.loading && <LoadDiv />}
              <div className="scrollDiv" ref={WrapRef}></div>
            </React.Fragment>
          ) : (
            <div className="noData TxtCenter mTop50 mBottom50">
              <span className="iconCon InlineBlock TxtCenter ">
                <i className={`icon-${noDataIcon || 'workflow_webhook'} Font64 TxtMiddle`} />
              </span>
              <p className="Gray_9e mTop20 mBottom0">{props.noDataTxt || _l('无相关数据')}</p>
            </div>
          )}
        </div>
      </div>
      <div className="scrollDiv" ref={WrapBotttomRef}></div>
    </Wrap>
  );
}

export default APITable;
