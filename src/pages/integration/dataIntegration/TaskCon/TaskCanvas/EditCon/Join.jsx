import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Popover, Select } from 'ming-ui/antd-components';
import { JOIN_TYPE } from '../config';
import { ALL_OPERATION_TYPE_DATA, TYPE_DATA } from '../config';
import { WrapL } from './style';

const PopupWrap = styled.ul`
  li {
    width: 80px;
    padding: 14px 0;
    text-align: center;
    .icon {
      color: var(--color-primary);
    }
    &.isCur {
      background: var(--color-primary-transparent);
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
    }
    .toolTipCon {
      border-radius: 6px;
      width: auto;
      background: var(--color-background-primary);
      box-shadow: var(--shadow-lg);
      position: absolute;
      bottom: calc(100% + 11px);
      left: -100px;
      z-index: -1;
      opacity: 0;
      display: none;
      transition: all 0.5s;
      padding: 16px 24px;
      .titleTips {
        padding-bottom: 10px;
      }
      .triangle {
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid var(--color-white);
        transform: rotate(180deg);
        position: absolute;
        bottom: -6px;
        left: 130px;
      }
    }
    &:hover {
      .toolTipCon {
        opacity: 1;
        z-index: 1;
        display: block;
      }
    }
  }
  li:nth-child(1) {
    border-radius: 6px 0px 0px 6px;
  }
  li:nth-child(3) {
    border-radius: 0 6px 6px 0px;
  }
`;
const DropWrap = styled.div`
  margin: 0 10px;
`;

export default function Join(props) {
  const { renderCard, onUpdate, flowData } = props;
  const { flowNodes } = flowData;
  const [{ node, conditions, visible, joinType, spliceType, leftFieldNames, rightFieldNames }, setState] = useSetState({
    node: props.node,
    joinType: 'INNER_JOIN',
    conditions: [],
    visible: false,
    spliceType: 'AND',
    leftFieldNames: [],
    rightFieldNames: [],
  });
  useEffect(() => {
    const { node = {} } = props;
    const {
      leftTableId,
      rightTableId,
      joinType = 'INNER_JOIN',
      conditions,
    } = _.get(node, ['nodeConfig', 'config']) || {};
    const { logicalOperator = 'AND' } = (conditions || [])[0] || {};
    setState({
      node,
      leftFieldNames: getNodeFields(leftTableId),
      rightFieldNames: getNodeFields(rightTableId),
      joinType,
      spliceType: logicalOperator,
      conditions: _.get(node, 'nodeConfig.config.conditions'),
    });
  }, [props]);
  //预览节点数据
  const getNodeFields = nodeId => {
    if (!nodeId) {
      return [];
    }

    const data = flowNodes[nodeId] || {};
    return (_.get(data, 'nodeConfig.fields') || []).filter(o => !!o.isCheck);
  };

  const renderPopup = () => {
    return (
      <PopupWrap className="joinDropTriggerWrap flexRow alignItemsCenter">
        {JOIN_TYPE.map(o => {
          return (
            <li
              className={cx('Hand Relative', { isCur: o.type === joinType })}
              onClick={() => {
                setState({
                  joinType: o.type,
                });
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
              }}
            >
              <div className="Bold">{o.txt}</div>
              <div className={cx(`iconImg InlineBlock ${o.img}`)} style={{ width: 24, height: 24 }}></div>
              <div class="toolTipCon">
                <div className="Bold TxtLeft textPrimary titleTips">{o.tips}</div>
                <div
                  className={cx(`iconImg bgImg${o.img}`)}
                  style={{ width: 456, height: o.type === 'INNER_JOIN' ? 254 : 277 }}
                ></div>
                <div className="triangle"></div>
              </div>
            </li>
          );
        })}
      </PopupWrap>
    );
  };

  const updateData = (key, i, data) => {
    let dat = {
      ...node,
      nodeConfig: {
        ...(node.nodeConfig || {}),
        config: {
          ...(_.get(node, 'nodeConfig.config') || {}),
          conditions: conditions.map((a, n) => {
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
    };
    onUpdate(dat);
  };

  const renderTitle = data => {
    const { dataType, alias, name, aggFuncType } = data || {};

    if (!name && !dataType) {
      return <span className="Red">{_l('该字段已删除')}</span>;
    }

    return (
      <div>
        {dataType && <span className="textSecondary pRight5">[{dataType}]</span>}
        {alias}
        {aggFuncType && (
          <span className="textTertiary">({ALL_OPERATION_TYPE_DATA.find(o => o.value === aggFuncType).text})</span>
        )}
      </div>
    );
  };

  const renderItem = a => {
    return (
      <div className="">
        {a.alias}
        {a.aggFuncType && (
          <span className="aggFuncType"> ({ALL_OPERATION_TYPE_DATA.find(o => o.value === a.aggFuncType).text})</span>
        )}
      </div>
    );
  };

  return (
    <WrapL>
      <div className="title Bold">{_l('多表连接')}</div>
      <div className="desCon">{_l('多表连接后左右两个数据表将按设置的条件进行匹配，并将符合条件的记录进行合并。')}</div>
      <div className="title mTop20">{_l('数据源')}</div>
      <div className="con flexRow alignItemsCenter">
        {[
          flowNodes[_.get(node, 'nodeConfig.config.leftTableId')],
          flowNodes[_.get(node, 'nodeConfig.config.rightTableId')],
        ].map((o, i) => {
          let typeData = JOIN_TYPE.find(it => it.type === joinType) || {};
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
                <Popover
                  noPadding
                  open={visible}
                  trigger="click"
                  content={renderPopup()}
                  getPopupContainer={() => document.body}
                  onOpenChange={visible => {
                    setState({ visible });
                  }}
                  placement="bottom"
                >
                  <DropWrap className={cx('joinDrop flexColumn alignItemsCenter Hand', { visible })}>
                    <div className="colorPrimary Bold">{typeData.txt}</div>
                    <div className={cx(`iconImg InlineBlock ${typeData.img}`)} style={{ width: 24, height: 24 }}></div>
                    <i className="icon icon-arrow-down-border textDisabled" />
                  </DropWrap>
                </Popover>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="title mTop20">{_l('连接条件')}</div>
      {(conditions || []).map((o, i) => {
        const { leftField, rightField } = o;
        return (
          <div className="joinCondition flexRow alignItemsCenter mTop16">
            <Select
              placeholder={_l('请选择')}
              value={leftField.id}
              labelRender={() => renderTitle(leftField)}
              className="mRight12 dropCondition"
              classNames={{ popup: { root: 'dropConditionTri' } }}
              showPopupSearch
              optionFilterProp="label"
              allowClear
              options={leftFieldNames.map(a => {
                return {
                  ...a,
                  label: a.alias,
                  value: a.id,
                };
              })}
              optionRender={({ data }) => renderItem(data)}
              onChange={id => {
                let data = leftFieldNames.find(a => a.id === id) || {};
                updateData('leftField', i, data);
              }}
            />
            =
            <Select
              placeholder={_l('请选择')}
              className="mLeft12 dropCondition"
              classNames={{ popup: { root: 'dropConditionTri' } }}
              value={rightField.id}
              onChange={id => {
                let data = rightFieldNames.find(a => a.id === id) || {};
                updateData('rightField', i, data);
              }}
              showPopupSearch
              optionFilterProp="label"
              allowClear
              labelRender={() => renderTitle(rightField)}
              options={rightFieldNames
                .filter(o => o.jdbcTypeId === leftField.jdbcTypeId && leftField.jdbcTypeId) //右边需要根据左边的jdbcTypeId
                .map(a => {
                  return { ...a, label: a.alias, value: a.id };
                })}
              optionRender={({ data }) => renderItem(data)}
            />
            {conditions.length > 1 && i === 0 && (
              <div className="andOr flexRow alignItemsCenter">
                <Select
                  defaultValue={spliceType}
                  className="andOrDrop"
                  variant="borderless"
                  // disabled={i > 0}
                  options={TYPE_DATA}
                  onChange={spliceType => {
                    onUpdate({
                      ...node,
                      nodeConfig: {
                        ...(node.nodeConfig || {}),
                        config: {
                          ...(_.get(node, 'nodeConfig.config') || {}),
                          conditions: (conditions || []).map(a => {
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
                  onUpdate({
                    ...node,
                    nodeConfig: {
                      ...(node.nodeConfig || {}),
                      config: {
                        ...(_.get(node, 'nodeConfig.config') || {}),
                        conditions: (conditions || []).filter((a, index) => i !== index),
                      },
                    },
                  });
                }}
              ></i>
            )}
          </div>
        );
      })}
      <div
        className="addCondition Hand textPrimary flewRow alignItemsCenter mTop16"
        onClick={() => {
          setState({
            conditions: (conditions || []).concat({
              leftField: {},
              rightField: {},
              relOperator: 'EQ',
              logicalOperator: spliceType,
            }),
          });
        }}
      >
        <i className="icon icon-add1 textPrimary mRight3" />
        {_l('条件')}
      </div>
    </WrapL>
  );
}
