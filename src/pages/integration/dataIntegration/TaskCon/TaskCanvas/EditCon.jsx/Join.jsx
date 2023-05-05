import React, { useState, useEffect, useRef } from 'react';
import { WrapL } from './style';
import { useSetState } from 'react-use';
import { JOIN_TYPE } from '../config';
import { Dropdown, Tooltip } from 'ming-ui';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import _ from 'lodash';
import { TYPE_DATA } from '../config';

const PopupWrap = styled.ul`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
  border-radius: 6px;
  li {
    width: 80px;
    padding: 14px 0;
    overflow: hidden;
    text-align: center;
    .icon {
      color: #2196f3;
    }
    &.isCur {
      background: rgba(33, 150, 243, 0.08);
      color: #2196f3;
      border: 1px solid #2196f3;
    }
  }
  li:nth-child(1) {
    border-radius: 6px 0px 0px 6px;
  }
  li:nth-child(4) {
    border-radius: 0 6px 6px 0px;
  }
`;
const DropWrap = styled.div`
  margin: 0 10px;
`;
export default function Join(props) {
  const { renderCard,  onUpdate, list, nodeList } = props;
  const [{ node, condition, visible, joinType, spliceType, leftFieldNames, rightFieldNames }, setState] = useSetState({
    node: props.node,
    leftNode: {},
    rightNode: {},
    joinType: 'INNER_JOIN',
    condition: [],
    visible: false,
    spliceType: 'AND',
    leftFieldNames: [],
    rightFieldNames: [],
  });
  useEffect(() => {
    const { node = {} } = props;
    const { pathIds } = node;
    const {
      leftTableId,
      rightTableId,
      joinType = 'INNER_JOIN',
      condition = [],
    } = _.get(node, ['nodeConfig', 'config']) || {};
    const { logicalOperator = 'AND' } = condition[0] || {};
    setState({
      node,
      leftFieldNames: getNodeData(leftTableId),
      rightFieldNames: getNodeData(rightTableId),
      joinType,
      spliceType: logicalOperator,
    });
  }, [props]);
  //预览节点数据
  const getNodeData = nodeId => {
    if (!nodeId) {
      return [];
    }
    const data = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId);
    const d = data.find(o => o.nodeId === nodeId) || {};
    return (d.fields || [])[0] || [];
  };
  const renderPopup = () => {
    return (
      <PopupWrap className="flexRow alignItemsCenter">
        {JOIN_TYPE.map(o => {
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
                className={cx('Hand', { isCur: o.type === joinType })}
                onClick={() => {
                  onUpdate({
                    ...node,
                    nodeConfig: {
                      ...(node.nodeConfig || {}),
                      config: {
                        ...(_.get(node, 'nodeConfig.config') || {}),
                        joinType: o.type,
                      },
                    },
                  });
                  setState({
                    joinType: o.type,
                  });
                }}
              >
                <div className="Bold">{o.txt}</div>
                <div className={cx(`iconImg InlineBlock ${o.img}`)} style={{ width: 24, height: 24 }}></div>
              </li>
            </Tooltip>
          );
        })}
      </PopupWrap>
    );
  };
  const updateData = (key, i, data) => {
    onUpdate({
      ...node,
      nodeConfig: {
        ...(node.nodeConfig || {}),
        config: {
          ...(_.get(node, 'nodeConfig.config') || {}),
          condition: condition.map((a, n) => {
            if (n === i) {
              return {
                ...a,
                [key]: data,
              };
            } else {
              return a;
            }
          }),
        },
      },
    });
  };
  const renderTitle = data => {
    const { dataType, name } = data;
    return (
      <div>
        <span className="Gray_75">[`{$dataType}`]</span>
        {name}
      </div>
    );
  };
  return (
    <WrapL>
      <div className="title Bold">{_l('多表连接')}</div>
      <div className="desCon">{_l('多表连接后左右两个数据表将按设置的条件进行匹配，并将符合条件的记录进行合并。')}</div>
      <div className="title mTop20">{_l('数据源')}</div>
      <div className="con flexRow alignItemsCenter">
        {list
          .filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)
          .map((o, i) => {
            return (
              <React.Fragment>
                {renderCard(o)}
                {i % 2 === 0 && (
                  <Trigger
                    popupVisible={visible}
                    action={['click']}
                    popupClassName="joinDropTriggerWrap"
                    popup={renderPopup()}
                    getPopupContainer={() => document.body}
                    onPopupVisibleChange={visible => {
                      setState({ visible });
                    }}
                    popupAlign={{
                      points: ['tc', 'bc'],
                      offset: [0, 10],
                      overflow: { adjustX: true, adjustY: true },
                    }}
                  >
                    <DropWrap className={cx('joinDrop flexColumn alignItemsCenter Hand', { visible })}>
                      <div className="ThemeColor3 Bold">{(JOIN_TYPE.find(o => o.type === joinType) || {}).txt}</div>
                      <div
                        className={cx(`iconImg InlineBlock ${JOIN_TYPE.find(o => o.type === joinType || {}).img}`)}
                        style={{ width: 24, height: 24 }}
                      ></div>
                      <i className="icon icon-arrow-down-border Gray_bd" />
                    </DropWrap>
                  </Trigger>
                )}
              </React.Fragment>
            );
          })}
      </div>
      <div className="title mTop20">{_l('连接条件')}</div>
      {condition.map((o, i) => {
        const { leftTableId = '', rightTableId = '', leftField = {}, rightField = {} } = o;
        return (
          <div className="joinCondition flexRow alignItemsCenter mTop16">
            <Dropdown
              placeholder={_l('请选择')}
              value={leftField.id}
              renderTitle={value => {
                let data = leftFieldNames.find(a => a.id === value) || {};
                return renderTitle(data);
              }}
              className="mRight12 dropCondition"
              border
              openSearch
              cancelAble
              isAppendToBody
              data={leftFieldNames.map(a => {
                return { ...a, text: a.name, value: a.id };
              })}
              onChange={id => {
                let data = leftFieldNames.find(a => a.id === value) || {};
                updateData('leftField', i, data);
              }}
            />
            =
            <Dropdown
              placeholder={_l('请选择')}
              className="mLeft12 dropCondition"
              value={rightField.id}
              onChange={id => {
                let data = leftFieldNames.find(a => a.id === value) || {};
                updateData('rightField', i, data);
              }}
              border
              openSearch
              cancelAble
              isAppendToBody
              renderTitle={value => {
                let data = rightFieldNames.find(a => a.id === value) || {};
                return renderTitle(data);
              }}
              data={rightFieldNames.map(a => {
                return { ...a, text: a.name, value: a.id };
              })}
            />
            {condition.length > 1 && i === 0 && (
              <div className="andOr flexRow alignItemsCenter">
                <Dropdown
                  dropIcon="task_custom_btn_unfold"
                  defaultValue={spliceType}
                  className="andOrDrop"
                  isAppendToBody
                  menuStyle={{ width: 46 }}
                  // disabled={i > 0}
                  data={TYPE_DATA}
                  onChange={spliceType => {
                    console.log(spliceType);
                    onUpdate({
                      ...node,
                      nodeConfig: {
                        ...(node.nodeConfig || {}),
                        config: {
                          ...(_.get(node, 'nodeConfig.config') || {}),
                          condition: condition.map((a, index) => {
                            return { ...a, logicalOperator: spliceType };
                          }),
                        },
                      },
                    });
                    setState({
                      spliceType,
                    });
                  }}
                />
              </div>
            )}
            {i > 0 && (
              <i
                className="icon icon-close closeBtn Hand Font16 mLeft5"
                onClick={() => {
                  setState({
                    condition: condition.filter((a, index) => i !== index),
                  });
                }}
              ></i>
            )}
          </div>
        );
      })}
      <div
        className="addCondition Hand Gray flewRow alignItemsCenter mTop16"
        onClick={() => {
          setState({
            condition: condition.concat({}),
          });
        }}
      >
        <i className="icon icon-add1 Gray mRight3" />
        {_l('条件')}
      </div>
    </WrapL>
  );
}
