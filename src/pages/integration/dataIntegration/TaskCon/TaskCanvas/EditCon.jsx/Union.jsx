import React, { useState, useEffect, useRef } from 'react';
import { WrapL } from './style';
import { useSetState } from 'react-use';
import { UNION_TYPE_LIST } from '../config';
import { Tooltip } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';
export default function Union(props) {
  const { renderCard, nodeList, onUpdate, list } = props;
  const [{ node, leftNode, rightNode, unionType }, setState] = useSetState({
    node: props.node,
    leftNode: {},
    rightNode: {},
    unionType: 'UNION_ALL',
  });
  useEffect(() => {
    const { node = {} } = props;
    const { pathIds } = node;
    const { leftTableId, rightTableId, unionType = 'UNION_ALL' } = _.get(node, ['nodeConfig', 'config']) || {};
    const data = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId);

    setState({
      node,
      leftNode: data[0],
      rightNode: data[1],
      unionType,
    });
  }, [props.node]);

  return (
    <WrapL>
      <div className="title Bold">{_l('数据合并')}</div>
      <div className="desCon">{_l('将两个数据表的行记录合并到一个数据表。')}</div>
      <div className="title mTop20">{_l('数据源')}</div>
      <div className="con flexRow alignItemsCenter">
        {[leftNode, rightNode].map((o, i) => {
          return (
            <React.Fragment>
              {renderCard(o)}
              {i % 2 === 0 && (
                <div
                  className={cx(
                    `iconImg InlineBlock mLeft20 mRight20 ${
                      (UNION_TYPE_LIST.find(it => it.type === unionType) || {}).img
                    }`,
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
            <Tooltip
              text={
                <span
                  className="Block"
                  style={{
                    maxWidth: 230,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {o.tips}
                </span>
              }
              action={['hover']}
            >
              <li
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
            </Tooltip>
          );
        })}
      </ul>
    </WrapL>
  );
}
