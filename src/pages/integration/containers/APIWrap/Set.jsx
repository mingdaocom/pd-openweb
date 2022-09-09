import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import ConnectAvator from '../../components/ConnectAvator';
import Card from './Card';

const Wrap = styled.div`
  padding: 0 24px 24px;
  .apiCard {
    max-width: 800px;
    width: 100%;
    margin: 24px auto 0;
    align-items: center;
    padding: 12px 24px;
    background: #ffffff;
    border-radius: 6px;
    img {
      width: 46px;
      height: 46px;
      background: #ffffff;
      border-radius: 50%;
    }
  }
  .toConnect {
    color: #757575;
    border: 1px solid #ebebeb;
    padding: 3px 19px;
    border-radius: 28px;
    &:hover {
      color: #2196f3;
      border: 1px solid #2196f3;
    }
  }
`;
export default function Set(props) {
  const canEdit = props.connectInfo.type === 1 && props.isConnectOwner;
  return (
    <Wrap className="flexColumn">
      {(props.connectInfo || {}).name &&
        (location.href.indexOf('/integrationApi') >= 0 || location.href.indexOf('/api') >= 0) && (
          <div className="apiCard flexRow">
            <ConnectAvator {...props.connectInfo} width={46} size={32} />
            <div className="flex mLeft15 overflowHidden">
              <h5 className="Font14 Bold InlineBlock">{props.connectInfo.name}</h5>
              {props.connectInfo.type === 2 && _.get(props, ['connectInfo', 'info', 'docUrl']) && (
                // 安装的API 顶部显示所属API连接的卡片信息（有文档链接icon
                <Icon
                  className="Hand InlineBlock ThemeColor3 mLeft5"
                  icon="task-new-detail"
                  onClick={() => {
                    window.open(_.get(props, ['connectInfo', 'info', 'docUrl']));
                  }}
                />
              )}
              <p className="Font13">
                <span>
                  {props.connectInfo.apiCount > 0 && (
                    <span className="Gray_75">{_l('%0 个API', props.connectInfo.apiCount)}</span>
                  )}
                  {(props.connectInfo.apks || []).length > 0 && (
                    <span className="Gray_75 mLeft6">{_l('已授权给 %0 个应用', props.connectInfo.apks.length)}</span>
                  )}
                </span>
              </p>
            </div>

            {/* 超级管理员和拥有者才能查看连接 */}
            {props.isConnectOwner && (
              <a
                className="mLeft15 toConnect"
                href={`/integrationConnect/${localStorage.getItem('currentProjectId')}/${props.connectInfo.id}`}
                target="_blank"
              >
                {_l('查看')}
              </a>
            )}
          </div>
        )}
      <Card
        {...props}
        className="mTop24"
        typeId={23}
        title={_l('输入参数')}
        des={_l('输入参数用于在工作表或工作流中使用 API 查询时，可以传入动态值')}
        icon={'input'}
        support={'https://help.mingdao.com/integration.html#输入参数'}
        canEdit={canEdit}
      />
      <Card
        {...props}
        typeId={8}
        title={_l('API 请求参数')}
        des={_l('配置发送 API 请求时需要的 Query Param、Header、Body 等请求参数')}
        icon={'tune'}
        support={'https://help.mingdao.com/integration.html#api请求配置'}
        canEdit={canEdit}
      />
      <Card
        {...props}
        typeId={21}
        title={_l('输出参数')}
        des={_l('在 API 查询时，可以将输出参数的值绑定到工作表字段或被工作流节点引用')}
        icon={'output'}
        support={'https://help.mingdao.com/integration.html#输出参数'}
        canEdit={canEdit}
      />
    </Wrap>
  );
}
