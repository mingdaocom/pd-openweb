import React, { useState, useEffect, useRef } from 'react';
import { WrapL } from './style';
import { useSetState } from 'react-use';
import { UNION_TYPE_LIST } from '../config';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';
const PopupWrap = styled.div`
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  padding: 16px 24px;
  position: relative;
  .triangle {
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #fff;
    transform: rotate(180deg);
    position: absolute;
    bottom: -6px;
    left: 82px;
  }
`;
export default function Union(props) {
  const { renderCard, onUpdate, list } = props;
  const [{ node, leftNode, rightNode, unionType }, setState] = useSetState({
    node: props.node,
    leftNode: {},
    rightNode: {},
    unionType: 'UNION_ALL',
  });
  useEffect(() => {
    const { node = {} } = props;
    const { leftTableId, rightTableId, unionType = 'UNION_ALL' } = _.get(node, ['nodeConfig', 'config']) || {};
    setState({
      node,
      leftNode: list.find(o => o.nodeId === leftTableId),
      rightNode: list.find(o => o.nodeId === rightTableId),
      unionType,
    });
  }, [props.node]);
  const renderPopup = o => {
    return (
      <PopupWrap class="toolTipCon">
        <div className="Bold TxtLeft Gray Font13 titleTips">{o.txt}</div>
        <div className="Bold TxtLeft Gray_75 Font12 titleTips">{o.tips}</div>
        <div className={cx(`iconImg bgImg${o.tipImg} mTop10`)} style={{ width: 489, height: o.h }}></div>
        <div className="triangle"></div>
      </PopupWrap>
    );
  };
  return (
    <WrapL>
      <div className="title Bold">{_l('数据合并')}</div>
      <div className="desCon">{_l('将两个数据表的行记录合并到一个数据表。')}</div>
      <div className="title mTop20">{_l('数据源')}</div>
      <div className="con flexRow alignItemsCenter">
        {[leftNode, rightNode].map((o, i) => {
          return (
            <React.Fragment>
              <div
                className="flex"
                onClick={() => {
                  props.onChangeCurrentNode(o.nodeId);
                }}
              >
                {renderCard(o)}
              </div>
              {i % 2 === 0 && (
                <div
                  className={cx(
                    `iconImg Block mLeft20 mRight20 ${(UNION_TYPE_LIST.find(it => it.type === unionType) || {}).img}`,
                  )}
                  style={{ width: 24, height: 24 }}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="title mTop20">{_l('合并方式')}</div>
      <ul className="unionC flexRow alignItemsCenter">
        {UNION_TYPE_LIST.map(o => {
          return (
            <Trigger
              action={['hover']}
              popup={renderPopup(o)}
              mouseLeaveDelay={0.2}
              popupAlign={{
                points: ['bl', 'tl'],
                offset: [0, -10],
                overflow: { adjustX: true, adjustY: true },
              }}
            >
              <li
                key={o.txt}
                className={cx('mTop12 Hand flexCloumn alignItemsCenter TxtCenter justifyContentCenter', {
                  isCur: unionType === o.type,
                })}
                onClick={() => {
                  onUpdate({
                    ...node,
                    nodeConfig: {
                      ...(node.nodeConfig || {}),
                      config: {
                        ...(_.get(node, 'nodeConfig.config') || {}),
                        unionType: o.type,
                      },
                    },
                  });
                  setState({
                    unionType: o.type,
                  });
                }}
              >
                <div className="Bold">{o.txt}</div>
                <div className="er">{o.Er}</div>
              </li>
            </Trigger>
          );
        })}
      </ul>
    </WrapL>
  );
}
