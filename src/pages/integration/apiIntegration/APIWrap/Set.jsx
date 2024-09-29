import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import ConnectAvator from '../../components/ConnectAvator';
import Card from './Card';
import Item from './Item';
import { CARD_TYE_LIST } from 'src/pages/integration/config';
import _ from 'lodash';

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

function ItemCon(props) {
  return (
    <React.Fragment>
      <Item
        {...props}
        title={_l('代码块')}
        icon={'worksheet_API'}
        support={'https://help.mingdao.com/integration/api#enter-parameters'}
      />
      <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: '#ddd' }} />
    </React.Fragment>
  );
}

export default function Set(props) {
  const { flowNodeMap, startEventId } = _.get(props, ['info']) || {};
  const canEdit = props.connectInfo.type === 1 && props.isConnectOwner;
  const [newPreId, setNewId] = useState('');
  const [list, setList] = useState([]);
  useEffect(() => {
    let l = [];
    const getList = startEventId => {
      let data = flowNodeMap[startEventId];
      l.push(data);
      if (!!flowNodeMap[data.nextId]) {
        getList(data.nextId);
      }
    };
    getList(startEventId);
    let list = l.filter(o => [23, 8, 21, 14].includes(o.typeId));
    const i = list.findIndex(it => it.typeId === 23);
    list = list.filter((o, index) => index >= i);
    //过滤掉 输入参数 前面的节点
    setList(list);
  }, []);

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
              <a className="mLeft15 toConnect" href={`/integrationConnect/${props.connectInfo.id}`} target="_blank">
                {_l('查看')}
              </a>
            )}
          </div>
        )}
      <div className="mTop24"></div>
      {list.map((o, i) => {
        if ([23, 8, 21].includes(o.typeId)) {
          let desInfo = CARD_TYE_LIST.find(item => o.typeId === item.typeId);
          return (
            <React.Fragment>
              <Card
                {...props}
                nodeInfo={o}
                typeId={o.typeId}
                title={desInfo.title}
                des={desInfo.des}
                icon={desInfo.icon}
                support={desInfo.support}
                canEdit={canEdit}
                canAdd={
                  canEdit && //可编辑才可新增
                  o.typeId !== newPreId && //正在编辑下一个新增代码块
                  [23, 8].includes(o.typeId) && //目前就这两个节点后可以新增代码块
                  ![14].includes(list[i + 1].typeId) //是否已新增了代码块
                }
                onAddId={typeId => {
                  setNewId(typeId);
                }}
              />
              {i < list.length - 1 && (
                <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: '#ddd' }} />
              )}
              {newPreId === o.typeId && [23, 8].includes(o.typeId) && (
                <ItemCon
                  {...props}
                  isNew={true}
                  prveId={o.id}
                  nodeInfo={null}
                  des={
                    newPreId !== 8
                      ? _l('编写代码对输入参数进行处理后用于 API 请求参数，如计算签名等')
                      : _l('编写代码对 API 请求结果进行处理后用于输出参数')
                  }
                  onChange={() => {
                    setNewId('');
                  }}
                  onCancel={() => {
                    setNewId('');
                  }}
                  canEdit={canEdit}
                />
              )}
            </React.Fragment>
          );
        } else if (o.typeId == 14) {
          return (
            <ItemCon
              {...props}
              isNew={false}
              prveId={o.prveId}
              nodeInfo={o}
              des={
                (list[i - 1] || {}).typeId !== 8
                  ? _l('编写代码对输入参数进行处理后用于 API 请求参数，如计算签名等')
                  : _l('编写代码对 API 请求结果进行处理后用于输出参数')
              }
              onChange={() => {
                setNewId('');
              }}
              canEdit={canEdit}
            />
          );
        }
      })}
    </Wrap>
  );
}
