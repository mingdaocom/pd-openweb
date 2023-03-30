import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { Input, Checkbox, Dropdown } from 'ming-ui';
import cx from 'classnames';
// import { getNodeData } from '../util';
import FieldMappingList from 'src/pages/integration/dataIntegration/components/FieldsMappingList';
import { CREATE_TYPE } from 'src/pages/integration/dataIntegration/constant';
const Wrap = styled.div`
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  .conEdit {
    width: 800px;
    &.isMaxC {
      width: 1000px;
    }
    background: #ffffff;
    box-shadow: 0px 10px 24px rgba(0, 0, 0, 0.24);
    height: 100%;
    right: 0;
    position: absolute;
    .headCon {
      border: 1px solid #eaeaea;
      height: 55px;
      line-height: 55px;
      padding: 0 24px;
      .icon {
        color: #9e9e9e;
        &:hover {
          color: #2196f3;
        }
      }
    }
    .footerCon {
      padding: 12px 24px;
      height: 60px;
      background: #ffffff;
      bottom: 0;
      .btnCon {
        background: #2196f3;
        color: #fff;
        height: 36px;
        line-height: 36px;
        border: 1px solid #2196f3;
        border-radius: 3px;
        padding: 0 36px;
        &.cancleBtn {
          background: #fff;
          color: #2196f3;
        }
      }
    }
    .conC {
      overflow-y: auto;
      padding: 15px 24px;
      .listCon {
        height: auto;
      }
    }
  }
`;

const WrapCon = styled.div`
  .setSheetName {
    width: 640px;
  }
  .conTemplate {
    border-bottom: 1px solid #eaeaea;
  }
  .tableCon {
    border-top: 1px solid #eaeaea;
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
export default class CellEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      node: {
        ...props.node,
        nodeConfig: {
          ...props.node.nodeConfig,
          config: {
            ..._.get(props.node, ['nodeConfig', 'config']),
            fields: [
              {
                resultField: {
                  id: '27',
                  dependFieldIds: ['nwmzrh'],
                  name: 'corrine.kuhic',
                  dataType: 'xl53yp',
                  jdbcTypeId: 904,
                  precision: 325,
                  scale: 393,
                  isPk: true,
                  isNotNull: true,
                  alias: 'ehsz8s',
                  isCheck: true,
                  orderNo: 695,
                  status: 'NORMAL',
                },
                leftField: {
                  id: '27',
                  dependFieldIds: ['sy2dum'],
                  name: 'corrine.kuhic',
                  dataType: 'feg9c2',
                  jdbcTypeId: 925,
                  precision: 147,
                  scale: 180,
                  isPk: true,
                  isNotNull: true,
                  alias: 'kvt20q',
                  isCheck: true,
                  orderNo: 395,
                  status: 'NORMAL',
                },
                rightField: {
                  id: '27',
                  dependFieldIds: ['ufusam'],
                  name: 'corrine.kuhic',
                  dataType: 'gntoiz',
                  jdbcTypeId: 903,
                  precision: 645,
                  scale: 51,
                  isPk: true,
                  isNotNull: true,
                  alias: '62si67',
                  isCheck: true,
                  orderNo: 422,
                  status: 'NORMAL',
                },
              },
            ],
          },
          fields: [
            {
              id: '27',
              dependFieldIds: ['uwmnnu'],
              name: 'corrine.kuhic',
              dataType: 'w6o0rj',
              jdbcTypeId: 305,
              precision: 937,
              scale: 660,
              isPk: true,
              isNotNull: true,
              alias: '6wtk2u',
              isCheck: true,
              orderNo: 702,
              status: 'NORMAL',
            },
            {
              id: '28',
              dependFieldIds: ['uwmnnu'],
              name: 'corrine.kuhic',
              dataType: 'w6o0rj',
              jdbcTypeId: 305,
              precision: 937,
              scale: 660,
              isPk: true,
              isNotNull: true,
              alias: '6wtk2u',
              isCheck: true,
              orderNo: 702,
              status: 'NORMAL',
            },
          ],
        },
      },
      sheetName: '', //新建工作表的名称
    };
  }
  onChangeNodeConfig = (options, cb) => {
    const { node = {} } = this.state;
    let nodeData = {
      ...node,
      nodeConfig: {
        ...(node.nodeConfig || {}),
        ...options,
      },
    };
    this.setState(
      {
        node: nodeData,
      },
      () => {
        cb && cb();
      },
    );
  };
  renderTemplate = (fields = []) => {
    const isAll = fields.filter(o => o.isCheck).length >= fields.length;
    const isNotAll = fields.filter(o => o.isCheck).length < fields.length && fields.filter(o => o.isCheck).length > 0;
    return (
      <div className="conTemplate">
        <div className="header flexRow alignItemsCenter">
          <div className="itemBox itemBoxCheck">
            <Checkbox
              className="TxtMiddle InlineBlock mRight0 checked_selected checkBox "
              checked={isAll}
              clearselected={isNotAll}
              onClick={() => {
                this.onChangeNodeConfig({
                  fields: fields.map(o => {
                    return { ...o, isCheck: !isAll };
                  }),
                });
              }}
            ></Checkbox>
          </div>
          <div className="itemBox Gray_75">{_l('字段')}</div>
          <div className="itemBox Gray_75">{_l('类型')}</div>
          <div className="itemBox itemBoxCanEmpty Gray_75">{_l('不允许空')}</div>
          <div className="itemBox Gray_75">{_l('重命名')}</div>
        </div>
        {fields.map(item => {
          return (
            <div className="tableCon flexRow alignItemsCenter">
              <div className="itemBox itemBoxCheck">
                <Checkbox
                  className="TxtMiddle InlineBlock mRight0 checked_selected checkBox "
                  checked={item.isCheck}
                  onClick={() => {
                    this.onChangeNodeConfig({
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
              <div className="itemBox Gray">{item.name}</div>
              <div className="itemBox">{item.dataType}</div>
              <div className="itemBox itemBoxCanEmpty">
                <Checkbox
                  className="TxtMiddle InlineBlock mRight0 checked_selected checkBox "
                  checked={item.isNotNull}
                  disabled
                ></Checkbox>
              </div>
              <div className="itemBox">
                <Input
                  className="w100"
                  placeholder={_l('请输入')}
                  value={item.alias}
                  onChange={value => {
                    this.onChangeNodeConfig({
                      fields: fields.map(o => {
                        if (o.id === item.id) {
                          return { ...o, alias: value };
                        } else {
                          return o;
                        }
                      }),
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
  renderTemplateByUnion = () => {
    const { list } = this.props;
    const { node = {} } = this.state;
    const { leftTableId, rightTableId } = _.get(node, ['nodeConfig', 'config']) || {};
    const data = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId);
    let leftNode = data[0];
    let rightNode = data[1];
    const fields = _.get(node, ['nodeConfig', 'config', 'fields']) || [];
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
                this.onChangeNodeConfig({
                  config: {
                    ...(_.get(node, ['nodeConfig', 'config']) || {}),
                    fields: fields.map(it => {
                      return {
                        ...it,
                        resultField: {
                          ...(_.get(node, ['nodeConfig', 'config', 'fields', 'resultField']) || {}),
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
                    this.onChangeNodeConfig({
                      config: {
                        ...(_.get(node, ['nodeConfig', 'config']) || {}),
                        fields: fields.map((it, n) => {
                          if (n === i) {
                            return {
                              ...it,
                              resultField: {
                                ...field,
                                isCheck: !field.isCheck,
                              },
                            };
                          } else {
                            return it;
                          }
                        }),
                      },
                    });
                  }}
                ></Checkbox>
              </div>
              <div className={cx('itemBox Gray', { isNull: !leftField.id })}>{leftField.name}</div>
              <div className={cx('itemBox secondD', { isNull: !rightField.id })}>
                <Dropdown
                  placeholder=''
                  value={!rightField.id ? undefined : rightField.id}
                  className=" "
                  onChange={value => {
                    if (!value) {
                      const data =
                        (_.get(rightNode, ['nodeConfig', 'fields']) || []).find(it => it.id === rightField.id) || {};
                      this.onChangeNodeConfig({
                        config: {
                          ...(_.get(node, ['nodeConfig', 'config']) || {}),
                          fields: fields
                            .map((it, n) => {
                              if (n === i) {
                                return {
                                  ...it,
                                  rightField: {},
                                  resultField: { ...field, ..._.pick(leftField, ['dataType', 'name']) },
                                };
                              } else {
                                return it;
                              }
                            })
                            .concat({
                              leftField: {},
                              rightField: data,
                              resultField: { ...field, ..._.pick(data, ['dataType', 'name']) },
                            }),
                        },
                      });
                    } else {
                      const data = (_.get(rightNode, ['nodeConfig', 'fields']) || []).find(it => it.id === value) || {};
                      this.onChangeNodeConfig({
                        config: {
                          ...(_.get(node, ['nodeConfig', 'config']) || {}),
                          fields: fields
                            .map((it, n) => {
                              if (it.id === value) {
                                return {
                                  ...it,
                                  rightField: {},
                                  resultField: { ...field, ..._.pick(leftField, ['dataType', 'name']) },
                                };
                              }
                              if (n === i) {
                                return {
                                  ...it,
                                  rightField: data,
                                  resultField: { ...field, ..._.pick(data, ['dataType', 'name']) },
                                };
                              } else {
                                return it;
                              }
                            })
                            .filter(it => !!(it.resultField.id || it.rightField.id || it.leftField.id)),
                        },
                      });
                    }
                  }}
                  border
                  openSearch
                  cancelAble
                  isAppendToBody
                  data={(_.get(rightNode, ['nodeConfig', 'fields']) || [])
                    .filter(it => it.dataType === leftField.dataType)
                    .map(it => {
                      return { ...it, text: it.name, value: it.id };
                    })}
                />
              </div>
              <div className="itemBox ">
                <Input
                  className="w100"
                  placeholder={_l('请输入')}
                  value={field.alias}
                  onChange={alias => {
                    this.onChangeNodeConfig({
                      config: {
                        ...(_.get(node, ['nodeConfig', 'config']) || {}),
                        fields: fields.map((it, n) => {
                          if (n === i) {
                            return {
                              ...it,

                              resultField: { ...field, alias: alias },
                            };
                          } else {
                            return it;
                          }
                        }),
                      },
                    });
                  }}
                />
              </div>
              <div className="itemBox itemBoxType">{field.dataType}</div>
            </div>
          );
        })}
      </div>
    );
  };
  renderCon = () => {
    const { isAddSheet, list } = this.props;
    const { node = {} } = this.state;
    const { nodeType = '' } = node;
    const { sheetName } = this.state;
    //筛选|分类汇总 => 没有字段配置

    switch (nodeType) {
      case 'SOURCE_TABLE':
        // case 'FILTER':
        // case 'AGGREGATE':
        return (
          <WrapCon className={cx('flexColumn')}>{this.renderTemplate(_.get(node, ['nodeConfig', 'fields']))}</WrapCon>
        );
      case 'UNION':
        return <WrapCon className={cx('flexColumn')}>{this.renderTemplateByUnion(node)}</WrapCon>;
      case 'DEST_TABLE':
        const d = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
        return (
          <WrapCon className={cx('flexColumn')}>
            {isAddSheet && (
              <React.Fragment>
                <div className="name Bold pBottom12">{_l('工作表名称')}</div>
                <Input
                  className="setSheetName"
                  placeholder={_l('请输入')}
                  value={sheetName}
                  onChange={sheetName => {
                    this.setState({
                      sheetName,
                    });
                  }}
                />
              </React.Fragment>
            )}
            <FieldMappingList
              isCreate={isAddSheet}
              sourceData={{ ...d, sourceFields: _.get(d, ['nodeConfig', 'fields']), isDbType: true }}
              destData={{
                destFields: _.get(node, ['nodeConfig', 'fields']),
                isDbType: _.get(node, ['nodeConfig', 'config', 'dsType']) !== 'MING_DAO_YUN',
                dsType: _.get(node, ['nodeConfig', 'config', 'dsType']),
              }}
              fieldsMapping={_.get(node, ['nodeConfig', 'config', 'fieldsMapping'])}
              setFieldsMapping={mapping => {
                this.setState({
                  node: {
                    ...node,
                    nodeConfig: {
                      ..._.get(node, ['nodeConfig']),
                      config: {
                        ..._.get(node, ['nodeConfig', 'config']),
                        fieldsMapping: mapping,
                      },
                    },
                  },
                });
              }}
            />
          </WrapCon>
        );
      case 'JOIN':
        // const { leftTableId, rightTableId } = _.get(node, ['nodeConfig', 'config']) || {};
        // let leftNode = getNodeData(leftTableId, list);
        // let rightNode = getNodeData(rightTableId, list);
        const data = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId);
        let leftNode = data[0];
        let rightNode = data[1];
        return (
          <WrapCon className={cx('flexColumn')}>
            <div className="name Bold pBottom12">{leftNode.name}</div>
            {this.renderTemplate(_.get(leftNode, ['nodeConfig', 'fields']))}
            <div className="name Bold pBottom12 pTop12">{rightNode.name}</div>
            {this.renderTemplate(_.get(rightNode, ['nodeConfig', 'fields']))}
          </WrapCon>
        );
    }
  };
  render() {
    const { onClose, onSave } = this.props;
    const { node = {} } = this.state;
    const { nodeType = '' } = node;

    return (
      <Wrap className="">
        <div className={cx('conEdit flexColumn', { isMaxC: ['UNION', 'DEST_TABLE'].includes(nodeType) })}>
          <div className="headCon flexRow alignItemsCenter">
            <span className="Font18 Bold flex">{_l('编辑字段')}</span>
            <i
              className="icon icon-close  Hand Font20 mLeft10"
              onClick={() => {
                onClose();
              }}
            ></i>
          </div>
          <div className="conC flex">
            <div className="listCon">{this.renderCon()}</div>
          </div>
          <div className="footerCon">
            <span
              className="btnCon Hand InlineBlock saveBtn"
              onClick={() => {
                onSave(node);
              }}
            >
              {_l('保存')}
            </span>
            <span
              className="btnCon Hand InlineBlock cancleBtn mLeft20"
              onClick={() => {
                onClose();
              }}
            >
              {_l('取消')}
            </span>
          </div>
        </div>
      </Wrap>
    );
  }
}
