import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { Input, Checkbox, Dropdown } from 'ming-ui';
import cx from 'classnames';
import FieldMappingList from 'src/pages/integration/dataIntegration/components/FieldsMappingList';
import {
  DATABASE_TYPE,
  INVALID_MD_TYPE_SHEET,
  INVALID_MD_TYPE,
  SYSTEM_FIELD_IDS,
} from 'src/pages/integration/dataIntegration/constant.js';
import dataSourceApi from '../../../../api/datasource';
import LoadDiv from 'ming-ui/components/LoadDiv';
import {
  setFieldsMappingDefaultData,
  getInitFieldsMapping,
  getFields,
} from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util.js';
import _ from 'lodash';
const Wrap = styled.div`
  .selectItem {
    font-size: 13px;
    width: 100% !important;
  }
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
        &.disabled {
          border: 1px solid #bdbdbd;
          background: #bdbdbd;
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
      node: props.node || {},
      sheetName: _.get(props.node, ['nodeConfig', 'config', 'tableName']), //新建工作表的名称
      matchedTypes: {},
      loading: true,
      fileList: [],
    };
  }
  componentDidMount() {
    const { node = {} } = this.props;
    const { nodeType = '' } = node;
    if (nodeType === 'DEST_TABLE') {
      this.getFieldsDataTypeMatch(this.props);
    } else {
      this.setState({
        loading: false,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.node, nextProps.node) || !_.isEqual(this.props, nextProps)) {
      this.setState(
        {
          node: nextProps.node || {},
        },
        () => {
          const { nodeType = '' } = nextProps.node;
          if (nodeType === 'DEST_TABLE') {
            this.getFieldsDataTypeMatch(nextProps);
          }
        },
      );
    }
  }

  getFieldsDataTypeMatch = async nextProps => {
    const { list, node = {} } = nextProps || this.props;
    const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
    this.setState({
      loading: true,
    });
    const data = _.get(node, ['nodeConfig', 'config', 'createTable'])
      ? []
      : await getFields(preNode, node, this.props.currentProjectId);
    this.setState({
      fileList: data,
    });
    if (!_.get(node, 'nodeConfig.config.fieldsMapping') || _.get(node, 'nodeConfig.config.fieldsMapping').length <= 0) {
      const mapping = getInitFieldsMapping(
        _.get(preNode, ['nodeConfig', 'fields']).filter(o => {
          if (_.get(preNode, ['nodeConfig', 'config', 'dsType']) === DATABASE_TYPE.APPLICATION_WORKSHEET) {
            if (_.get(node, ['nodeConfig', 'config', 'dsType']) !== DATABASE_TYPE.APPLICATION_WORKSHEET) {
              return !_.includes(INVALID_MD_TYPE, o.mdType);
            } else {
              return !_.includes(INVALID_MD_TYPE_SHEET, o.mdType) && !_.includes(SYSTEM_FIELD_IDS, o.id);
            }
          } else {
            return true;
          }
        }),
        _.get(preNode, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
        _.get(node, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
      );
      const mapDt = await setFieldsMappingDefaultData({
        initMapping: mapping.filter(o => !!o.sourceField),
        destFields: data,
        isSetDefaultFields: !_.get(node, ['nodeConfig', 'config', 'createTable']),
        sourceFields: _.get(preNode, ['nodeConfig', 'fields']),
        isCreate: _.get(node, ['nodeConfig', 'config', 'createTable']),
        dataDestType: _.get(node, ['nodeConfig', 'config', 'dsType']),
        isSourceAppType: _.get(preNode, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
        isDestAppType: _.get(node, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
      });
      this.setState({
        matchedTypes: mapDt.matchedTypes,
        loading: false,
        node: {
          ...node,
          nodeConfig: {
            ...node.nodeConfig,
            config: { ..._.get(node, 'nodeConfig.config'), fieldsMapping: mapDt.fieldsMapping },
          },
        },
      });
    } else {
      const res = await dataSourceApi.fieldsDataTypeMatch({
        dataDestType: _.get(node, ['nodeConfig', 'config', 'dsType']),
        sourceFields: _.get(preNode, ['nodeConfig', 'fields']),
        isCreate: _.get(node, ['nodeConfig', 'config', 'createTable']),
      });
      this.setState({
        matchedTypes: res.matchedTypes,
        loading: false,
      });
    }
  };
  onChangeNodeConfig = (options, cb) => {
    const { node = {} } = this.state;
    let nodeData = {
      ...node,
      nodeConfig: {
        ..._.get(node, 'nodeConfig'),
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
                  placeholder=""
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
    const { list } = this.props;
    const { node = {}, matchedTypes = {} } = this.state;
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
        //上一个节点的数据
        const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
        return (
          <WrapCon className={cx('flexColumn')}>
            {_.get(node, ['nodeConfig', 'config', 'createTable']) && (
              <React.Fragment>
                <div className="name Bold pBottom12">{_l('新建表名称')}</div>
                <Input
                  className="setSheetName"
                  placeholder={_l('请输入')}
                  value={sheetName}
                  onChange={sheetName => {
                    this.setState({
                      sheetName,
                      node: {
                        ...node,
                        nodeConfig: {
                          ..._.get(node, ['nodeConfig']),
                          config: {
                            ..._.get(node, ['nodeConfig', 'config']),
                            tableName: sheetName,
                          },
                        },
                      },
                    });
                  }}
                />
                <div className="mTop45"></div>
              </React.Fragment>
            )}
            <FieldMappingList
              isCreate={_.get(node, ['nodeConfig', 'config', 'createTable'])}
              sourceData={{
                ...preNode,
                sourceFields: _.get(preNode, ['nodeConfig', 'fields']),
                isDbType: _.get(preNode, ['nodeConfig', 'config', 'dsType']) !== DATABASE_TYPE.APPLICATION_WORKSHEET,
              }}
              destData={{
                destFields: this.state.fileList,
                isDbType: _.get(node, ['nodeConfig', 'config', 'dsType']) !== DATABASE_TYPE.APPLICATION_WORKSHEET,
                dsType: _.get(node, ['nodeConfig', 'config', 'dsType']),
                isOurCreateTable: _.get(node, ['nodeConfig', 'config', 'isOurCreateTable']),
              }}
              fieldsMapping={_.get(node, ['nodeConfig', 'config', 'fieldsMapping'])}
              setFieldsMapping={mapping => {
                const data = mapping.map(o => {
                  if (!_.get(node, ['nodeConfig', 'config', 'createTable'])) {
                    return {
                      ...o,
                      destField: {
                        ...o.destField,
                        isCheck: !!_.get(o, 'destField.id'),
                      },
                    };
                  } else {
                    return o;
                  }
                });
                this.setState({
                  node: {
                    ...node,
                    nodeConfig: {
                      ..._.get(node, ['nodeConfig']),
                      config: {
                        ..._.get(node, ['nodeConfig', 'config']),
                        fieldsMapping: data,
                      },
                    },
                  },
                });
              }}
              matchedTypes={matchedTypes}
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
    const { node = {}, loading, sheetName } = this.state;
    const { nodeType = '' } = node;
    let disable = false;
    let txt = '';
    // 保存的限制。
    // 1. 最少一个勾选字段 【新建 和 已有】，新建判断勾选，已有判断是否有映射关系，因为已有没有勾选按钮
    // 2. 工作表的话要设置标题 数据库要有主键 【这个就是新建了】
    // 如果来源表没有主键 这个页面也不能保存
    //目的地表
    const fieldsMapping = _.get(node, ['nodeConfig', 'config', 'fieldsMapping']) || [];
    if (nodeType === 'DEST_TABLE') {
      if (fieldsMapping.filter(o => _.get(o, 'destField.isCheck')).length <= 0) {
        disable = true;
        txt = _l('未设置相关映射字段');
      }
      //新建
      if (_.get(node, ['nodeConfig', 'config', 'createTable'])) {
        if (!sheetName) {
          disable = true;
          txt = _l('新建表未设置表名称');
        }
        if (
          fieldsMapping.filter(o => _.get(o, 'destField.isCheck') && !!(_.get(o, 'destField.name') || '').trim())
            .length < fieldsMapping.filter(o => _.get(o, 'destField.isCheck')).length
        ) {
          disable = true;
          txt = _l('未设置相关映射字段');
        }
        //目的地为工作表
        if (_.get(node, ['nodeConfig', 'config', 'dsType']) === DATABASE_TYPE.APPLICATION_WORKSHEET) {
          //标题字段
          if (fieldsMapping.filter(o => _.get(o, 'destField.isTitle') && !!_.get(o, 'destField.isCheck')).length <= 0) {
            disable = true;
            txt = _l('目标工作表未设置标题字段');
          }
        } else if (_.get(node, ['nodeConfig', 'config', 'dsType']) !== DATABASE_TYPE.APPLICATION_WORKSHEET) {
          //标题字段
          if (fieldsMapping.filter(o => _.get(o, 'destField.isPk')).length <= 0) {
            disable = true;
            txt = _l('目标工作表未设置主键 ');
          }
        }
      } else {
        if (fieldsMapping.filter(o => !!_.get(o, 'sourceField.isPk')).length > 0) {
          //主键未设置相关映射
          if (
            fieldsMapping.filter(
              o => !!_.get(o, 'sourceField.isPk') && !!_.get(o, 'destField.isCheck') && !!_.get(o, 'destField.id'),
            ).length <= 0
          ) {
            disable = true;
            txt = _l('主键未设置相关映射');
          }
        }
      }
    }
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
          {loading ? (
            <LoadDiv />
          ) : (
            <React.Fragment>
              <div className="conC flex">
                <div className="listCon">{this.renderCon()}</div>
              </div>
              <div className="footerCon">
                <span
                  className={cx('btnCon Hand InlineBlock saveBtn', {
                    disabled: loading || disable,
                  })}
                  onClick={() => {
                    if (loading) {
                      return;
                    }
                    if (disable) {
                      alert(txt, 3);
                      return;
                    }
                    if (nodeType === 'DEST_TABLE') {
                      const mapping = _.get(node, ['nodeConfig', 'config', 'fieldsMapping']) || [];
                      const data = mapping.map(o => {
                        if (!_.get(o, 'destField.isCheck')) {
                          return {
                            ...o,
                            destField: null,
                          };
                        } else {
                          return o;
                        }
                      });
                      onSave({
                        ...node,
                        nodeConfig: {
                          ..._.get(node, ['nodeConfig']),
                          config: {
                            ..._.get(node, ['nodeConfig', 'config']),
                            fieldsMapping: data,
                          },
                          fields: data.map(o => o.destField).filter(o => !!o),
                        },
                      });
                    }
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
            </React.Fragment>
          )}
        </div>
      </Wrap>
    );
  }
}
