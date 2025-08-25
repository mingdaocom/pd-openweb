import React from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, Input, Tooltip } from 'ming-ui';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import Des from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/Des';
import {
  ACTION_LIST,
  ALL_OPERATION_TYPE_DATA,
} from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
import { getIconByType } from 'src/pages/widgetConfig/util';
import DestEdit from './Dest';

const WrapCon = styled.div`
  .setSheetName,
  .pkDrop {
    width: 640px;
  }
  .conTemplate {
    border-bottom: 1px solid #eaeaea;
  }
  .tableCon {
    position: relative;
    border-top: 1px solid #eaeaea;
    .deleteIcon {
      position: absolute;
      left: -15px;
      top: 16px;
      display: none;
      font-size: 16px;
      color: #bdbdbd;
      cursor: pointer;
      &:hover {
        color: #f00;
      }
    }
    &:hover {
      background: #fafafa;
      .deleteIcon {
        display: block;
      }
    }
  }
  .header {
    font-weight: 400;
  }
  .itemBox {
    flex-grow: 0;
    flex-shrink: 0;
    padding: 5px;
    flex: 1;
    &.itemBoxCheck {
      width: 26px;
      flex: none;
    }
    &.itemBoxCanEmpty {
      width: 100px;
      color: #aaa;
      flex: none;
    }
  }
  .conTemplateByUnion {
    border-top: 1px solid #eaeaea;
    border-bottom: 1px solid #eaeaea;
    .itemBox {
      &.itemBoxType {
        width: 100px;
        flex: none;
      }
      &.secondD {
        border-left: 1px solid #eaeaea;
        border-right: 1px solid #eaeaea;
      }
      height: 48px;
      min-width: 48px;
      line-height: 48px;
      padding: 0 12px;
    }
    .tableCon {
      .itemBox {
        &.isNull {
          background: #f5f5f5 !important;
        }
        &.secondD {
          .ming.Dropdown,
          .dropdownTrigger {
            width: 100%;
            vertical-align: middle;
          }
          .ming.Dropdown .Dropdown--input,
          .dropdownTrigger .Dropdown--input {
            padding-left: 0;
          }
          .ming.Dropdown .Dropdown--border,
          .dropdownTrigger .Dropdown--border,
          .ming.Dropdown .Dropdown--border:hover,
          .dropdownTrigger .Dropdown--border:hover,
          .ming.Dropdown .Dropdown--border.active,
          .dropdownTrigger .Dropdown--border.active {
            border-color: transparent;
          }
        }
      }
    }
  }
`;
export default function SlideLayerTem(props) {
  const onChangeNodeConfig = options => {
    const { onChangeInfo } = props;
    const { node = {} } = props.state;
    let nodeData = {
      ...node,
      nodeConfig: {
        ..._.get(node, 'nodeConfig'),
        ...options,
      },
    };
    onChangeInfo({
      node: nodeData,
    });
  };
  const renderTemplate = (fields = [], isAppWorksheet, cb, hideIsNull) => {
    const isAll = fields.filter(o => o.isCheck).length >= fields.length;
    const isNotAll = fields.filter(o => o.isCheck).length < fields.length && fields.filter(o => o.isCheck).length > 0;
    const { onChangeInfo, state } = props;
    const { duplicates = [] } = state;
    return (
      <div className="conTemplate">
        <div className="header flexRow alignItemsCenter">
          <div className="itemBox itemBoxCheck">
            <Checkbox
              className="TxtMiddle InlineBlock mRight0 checked_selected checkBox "
              checked={isAll}
              clearselected={isNotAll}
              onClick={() => {
                cb({
                  fields: fields.map(o => {
                    if ([22].includes(o.mdType)) {
                      return o;
                    }
                    return { ...o, isCheck: !isAll };
                  }),
                });
              }}
            ></Checkbox>
          </div>
          <div className="itemBox Gray_75">{_l('字段')}</div>
          {!isAppWorksheet && (
            <React.Fragment>
              <div className="itemBox Gray_75">{_l('类型')}</div>
              {!hideIsNull && <div className="itemBox itemBoxCanEmpty Gray_75">{_l('不允许NULL')}</div>}
            </React.Fragment>
          )}
          <div className="itemBox Gray_75">{_l('重命名')}</div>
        </div>
        {fields.map(item => {
          const isNotSupport = [22].includes(item.mdType); //排除分段
          return (
            <div className="tableCon flexRow alignItemsCenter">
              {item.isErr && (
                <Icon
                  className="deleteIcon"
                  icon="trash"
                  onClick={() => {
                    cb({
                      fields: fields.filter(o => o.id !== item.id),
                    });
                  }}
                />
              )}
              <div className="itemBox itemBoxCheck">
                <Checkbox
                  className="TxtMiddle InlineBlock mRight0 checked_selected checkBox "
                  checked={item.isCheck && !isNotSupport}
                  disabled={item.isErr || isNotSupport}
                  onClick={() => {
                    cb({
                      fields: fields.map(o => {
                        if (o.id === item.id) {
                          return { ...o, isCheck: !item.isCheck };
                        } else {
                          return o;
                        }
                      }),
                    });
                  }}
                ></Checkbox>
              </div>
              <div className="itemBox Gray TxtMiddle">
                {isAppWorksheet && (
                  <Icon
                    icon={getIconByType(item.mdType, false)}
                    className={cx('Font16 Gray_bd customIcon mRight5 TxtMiddle')}
                  />
                )}
                <span className={cx({ Red: item.isErr })}> {item.name}</span>
                {isNotSupport && (
                  <div data-tip={_l('暂不支持同步')} className="tip-top pointer">
                    <Icon icon="help" className="Gray_bd mLeft5" />
                  </div>
                )}
                {item.aggFuncType && (
                  <span className="Gray_9e">
                    ({ALL_OPERATION_TYPE_DATA.find(o => o.value === item.aggFuncType).text})
                  </span>
                )}
                {item.isErr && (
                  <div data-tip={_l('字段已删除')} className="tip-top">
                    <Icon icon="info" className="Red mLeft5 isNoMatchOption" />
                  </div>
                )}
                {item.isTitle && isAppWorksheet && <Icon icon="ic_title" className="Gray_bd mLeft5" />}
                {item.isPk && ( //!isAppWorksheet &&
                  <div data-tip={_l('主键')} className="tip-top TxtMiddle">
                    <Icon icon="key1" className="Gray_bd mLeft5" />
                  </div>
                )}
              </div>
              {!isAppWorksheet && (
                <React.Fragment>
                  <div className="itemBox">{item.dataType}</div>
                  {!hideIsNull && <div className="itemBox itemBoxCanEmpty">{item.isNotNull && _l('是')}</div>}
                </React.Fragment>
              )}
              <div className="itemBox">
                <Input
                  className={cx('w100 AliasInput', { isErr: !!(duplicates || []).find(o => o === item.alias) })}
                  placeholder={_l('请输入')}
                  value={item.alias}
                  disabled={!!item.isFakePk && !item.isUniquePk}
                  onChange={value => {
                    cb({
                      fields: fields.map(o => {
                        if (o.id === item.id) {
                          return { ...o, alias: value };
                        } else {
                          return o;
                        }
                      }),
                    });
                    onChangeInfo({
                      duplicates: [],
                    });
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTemplateByUnion = () => {
    const { list } = props;
    const { node = {} } = props.state;
    const { leftTableId, rightTableId } = _.get(node, ['nodeConfig', 'config']) || {};
    let leftNode = list.find(o => o.nodeId === leftTableId) || {};
    let rightNode = list.find(o => o.nodeId === rightTableId) || {};
    const fields = _.get(node, 'nodeConfig.config.fields') || [];
    const isAll = fields.filter(o => _.get(o, ['resultField', 'isCheck'])).length >= fields.length;
    const isNotAll =
      fields.filter(o => _.get(o, ['resultField', 'isCheck'])).length < fields.length &&
      fields.filter(o => _.get(o, ['resultField', 'isCheck'])).length > 0;
    return (
      <div className="conTemplateByUnion">
        <div className="header flexRow alignItemsCenter">
          <div className="itemBox itemBoxCheck">
            <Checkbox
              className="TxtMiddle InlineBlock mRight0 checked_selected checkBox "
              checked={isAll}
              clearselected={isNotAll}
              onClick={() => {
                onChangeNodeConfig({
                  config: {
                    ...(_.get(node, ['nodeConfig', 'config']) || {}),
                    fields: fields.map(it => {
                      return {
                        ...it,
                        resultField: {
                          ...it.resultField,
                          isCheck: !isAll,
                        },
                      };
                    }),
                  },
                });
              }}
            ></Checkbox>
          </div>
          <div className="itemBox Gray_75 Bold">{leftNode.name}</div>
          <div className="itemBox Gray_75 Bold secondD">{rightNode.name}</div>
          <div className="itemBox Gray_75 Bold">{_l('合并后字段')}</div>
          <div className="itemBox Gray_75 Bold itemBoxType">{_l('类型')}</div>
        </div>
        {fields.map((item, i) => {
          const field = _.get(item, ['resultField']) || {};
          const leftField = _.get(item, ['leftField']) || {};
          const rightField = _.get(item, ['rightField']) || {};
          return (
            <div className="tableCon flexRow alignItemsCenter">
              <div className="itemBox itemBoxCheck">
                <Checkbox
                  className="TxtMiddle InlineBlock mRight0 checked_selected checkBox "
                  checked={field.isCheck}
                  onClick={() => {
                    onChangeNodeConfig({
                      config: {
                        ...(_.get(node, ['nodeConfig', 'config']) || {}),
                        fields: fields.map((it, n) => {
                          if (n === i) {
                            return {
                              ...it,
                              resultField: {
                                ...it.resultField,
                                isCheck: !field.isCheck,
                              },
                            };
                          } else {
                            //同名只能勾选一个
                            if (_.get(it, 'resultField.alias') === _.get(field, 'alias') && !field.isCheck) {
                              return {
                                ...it,
                                resultField: {
                                  ...it.resultField,
                                  isCheck: false,
                                },
                              };
                            }
                            return it;
                          }
                        }),
                      },
                    });
                  }}
                ></Checkbox>
              </div>
              <div className={cx('itemBox Gray', { isNull: !leftField.id })}>{leftField.alias}</div>
              <div className={cx('itemBox secondD', { isNull: !rightField.id })}>{rightField.alias}</div>
              <div className="itemBox ">{field.alias}</div>
              <div className="itemBox itemBoxType overflow_ellipsis WordBreak" title={field.dataType}>
                {field.dataType}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  //筛选|分类汇总 => 没有字段配置
  const renderCon = () => {
    const { state, flowData } = props;
    const { node = {}, fieldsBysource = [] } = state;
    const { nodeType = '' } = node;
    const { flowNodes } = flowData;
    switch (nodeType) {
      case 'SOURCE_TABLE':
        const isKafka = _.get(node, 'nodeConfig.config.dsType') === 'KAFKA';
        const isMD = _.get(node, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET;
        const canSetPk = fieldsBysource.filter(o => o.isPk).length <= 0 || isKafka || isMD;
        const pkField = _.get(node, 'nodeConfig.fields').find(o => o.isPk) || {};
        return (
          <WrapCon className={cx('flexColumn')}>
            {canSetPk && (
              <React.Fragment>
                <p className="mBottom16 bold">{_l('设置主键')}</p>
                <div className="flexRow alignItemsCenter mBottom20">
                  <span className="nowrap">{_l('在同步时，指定数据源字段')}</span>
                  <div className="Width120 mLeft12 mRight12">
                    <Select
                      className="selectItem"
                      options={(_.get(node, 'nodeConfig.fields') || [])
                        .filter(o => (o.isCanBePk && (o.isNotNull || isKafka)) || isMD)
                        .map(item => {
                          return {
                            label: (
                              <div className="flexRow alignItemsCenter">
                                <Icon icon={getIconByType(item.mdType, false)} className="Gray_9e Font18" />
                                <span title={item.name} className="mLeft8 overflow_ellipsis Gray">
                                  {item.name}
                                </span>
                              </div>
                            ),
                            value: item.id,
                          };
                        })}
                      value={pkField.id}
                      onChange={id => {
                        onChangeNodeConfig({
                          ...(_.get(node, 'nodeConfig.config') || {}),
                          fields: _.get(node, 'nodeConfig.fields').map(o => ({
                            ...o,
                            isPk: o.id === id,
                            isFakePk: o.id === id,
                          })),
                        });
                      }}
                    />
                  </div>
                  <span className="nowrap">{_l('为主键')}</span>
                  <Tooltip text={_l('仅用于数据同步，不会改变数据库字段属性，建议使用索引列。')} autoCloseDelay={0}>
                    <Icon icon="info_outline" className="Font16 Gray_bd pointer mLeft12" />
                  </Tooltip>
                </div>
              </React.Fragment>
            )}
            {renderTemplate(
              _.get(node, 'nodeConfig.fields'),
              _.get(node, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
              data => {
                onChangeNodeConfig({
                  ...data,
                  config: { ..._.get(node, 'nodeConfig.config'), ...data },
                });
              },
              isKafka,
            )}
          </WrapCon>
        );
      case 'UNION':
        return <WrapCon className={cx('flexColumn')}>{renderTemplateByUnion(node)}</WrapCon>;
      case 'DEST_TABLE':
        return (
          <WrapCon className={cx('flexColumn')}>
            <DestEdit
              {...props}
              key={`${_.get(node, 'nodeConfig.config.tableName')}_${_.get(node, 'nodeConfig.config.createTable')}`}
            />
          </WrapCon>
        );
      case 'JOIN':
        const {
          leftTableId,
          rightTableId,
          leftFields = [],
          rightFields = [],
        } = _.get(node, ['nodeConfig', 'config']) || {};
        let leftNode = flowNodes[leftTableId];
        let rightNode = flowNodes[rightTableId];

        const formatFields = (list = [], nodeList = []) => {
          let preFields = (list || []).filter(o => !!o.isCheck);
          let field = nodeList.map(o => {
            const parm = !(preFields.find(it => it.id === o.id) || {}).isCheck ? { isErr: true } : {};
            return {
              ...o,
              ...parm,
            };
          });
          let others = [];
          preFields.map(o => {
            if (!field.find(it => it.id === o.id)) {
              others = [...others, { ...o, isCheck: false }];
            }
          });
          return [...field, ...others];
        };
        return (
          <WrapCon className={cx('flexColumn')}>
            <div className="name pBottom12 Font16 flexRow alignItemsCenter">
              <span className="Bold">
                {ACTION_LIST.map(o => o.type).includes(leftNode.nodeType) ? (
                  _l('结果')
                ) : (
                  <Des nodeData={leftNode} className="InlineBlock" />
                )}
              </span>
              <span className="Gray_9e mLeft5 Font13">{leftNode.name}</span>
            </div>
            {renderTemplate(
              formatFields(_.get(leftNode, ['nodeConfig', 'fields']), leftFields || []),
              _.get(leftNode, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
              data => {
                onChangeNodeConfig({
                  ..._.get(node, 'nodeConfig'),
                  config: {
                    ..._.get(node, 'nodeConfig.config'),
                    leftFields: data.fields,
                  },
                  fields: [...data.fields, ...(_.get(node, 'nodeConfig.config.rightFields') || [])],
                });
              },
            )}
            <div className="name pBottom12 pTop12 Font16 flexRow alignItemsCenter">
              <span className="Bold">
                {ACTION_LIST.map(o => o.type).includes(rightNode.nodeType) ? (
                  _l('结果')
                ) : (
                  <Des nodeData={rightNode} className="InlineBlock" />
                )}
              </span>
              <span className="Gray_9e mLeft5 Font13">{rightNode.name}</span>
            </div>
            {renderTemplate(
              formatFields(_.get(rightNode, ['nodeConfig', 'fields']), rightFields || []),
              _.get(rightNode, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
              data => {
                onChangeNodeConfig({
                  ..._.get(node, 'nodeConfig'),
                  config: {
                    ..._.get(node, 'nodeConfig.config'),
                    rightFields: data.fields,
                  },
                  fields: [...(_.get(node, 'nodeConfig.config.leftFields') || []), ...data.fields],
                });
              },
            )}
          </WrapCon>
        );
    }
  };
  return <React.Fragment>{renderCon()}</React.Fragment>;
}
