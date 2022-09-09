import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv } from 'ming-ui';
import ConnectAvator from '../components/ConnectAvator';
const Wrap = styled.div`
  padding: 0 32px 32px;
  .noData {
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #f5f5f5;
      border-radius: 50%;
      margin: 120px auto 0;
      color: #9e9e9e;
    }
  }
  .addConnect {
    padding: 8px 24px;
    background: #2196f3;
    border-radius: 21px;
    color: #fff;
    display: inline-block;
    &:hover {
      background: #1764c0;
    }
  }
  .headTr {
  }
  .headTr,
  .conTr {
    margin: 0;
    p {
      margin: 0;
    }
    padding: 15px 0;
    border-bottom: 1px solid #e3e3e3;
    display: flex;
    & > div {
      flex: 12;
      display: flex;
      align-items: center;
    }
    .apiCount,
    .apkCount {
      max-width: 140px;
    }
    .name {
      flex: 40;
      overflow: hidden;
      padding-left: 8px;
    }
    .imgCon {
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      overflow: hidden;
      line-height: 36px;
      text-align: center;
      font-size: 20px;
    }
  }
  .conTr {
    &:hover {
      background: rgba(247, 247, 247, 1);
    }
  }
`;
// 滚动分页加载，每页30个，排序为添加时间倒序；
// 组织内的所有连接都显示，只有超级管理员和拥有者可以点击查看连接详情；
const keys = [
  {
    key: 'name',
    name: _l('名称'),
    render: item => {
      return (
        <div className="flexRow alignItemsCenter">
          <ConnectAvator {...item} width={36} size={22} />
          <div className="flex pLeft16 overflowHidden pRight16">
            <p className="Font15 Bold WordBreak">{item.name}</p>
            <p className="Font13 Gray_75 WordBreak overflow_ellipsis wMax100">{item.explain}</p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'apiCount',
    name: _l('API数量'),
  },
  {
    key: 'apkCount',
    name: _l('授权应用'),
  },
  {
    key: 'cid',
    name: _l('创建人'),
    render: item => {
      return <div className="pRight8">{item.ownerAccount.fullName}</div>;
    },
  },
  {
    key: 'ctime',
    name: _l('创建时间'),
    render: item => {
      return <span className="">{item.createdDate}</span>;
    },
  },
];

function ConnectList(props) {
  return (
    <Wrap>
      {props.pageIndex === 1 && props.loading ? (
        <LoadDiv />
      ) : props.list.length > 0 ? (
        <React.Fragment>
          <div className="tableCon">
            <div className="headTr">
              {keys.map(o => {
                return <div className={`${o.key}`}>{o.name}</div>;
              })}
            </div>
            {props.list.map(item => {
              return (
                <div
                  className="conTr Hand"
                  onClick={() => {
                    //只有超级管理员或拥有者可以查看详情 isOwner拥有者
                    if (item.isOwner || props.isSuperAdmin) {
                      props.onChange({ showConnect: true, connectData: item });
                    }
                  }}
                >
                  {keys.map(o => {
                    return <div className={`${o.key}`}>{o.render ? o.render(item) : item[o.key]}</div>;
                  })}
                </div>
              );
            })}
            {props.loading && props.pageIndex !== 1 && <LoadDiv />}
          </div>
        </React.Fragment>
      ) : (
        <div className="noData TxtCenter">
          <span className="iconCon InlineBlock TxtCenter ">
            <i className={`icon-connect Font64 TxtMiddle`} />
          </span>
          <p className="Gray_9e mTop20 mBottom0">
            {props.keywords ? _l('无匹配的结果，换一个关键词试试吧') : _l('暂无可用连接，请先创建 API 连接')}
          </p>
          {!props.keywords && props.featureType && (
            <span className="addConnect Bold Hand mTop24" onClick={() => props.onCreate()}>
              {_l('创建自定义连接')}
            </span>
          )}
        </div>
      )}
    </Wrap>
  );
}

export default ConnectList;
