import React, { Component } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, LoadDiv, Tooltip } from 'ming-ui';
import { NODE_TYPE_LIST, ACTION_LIST, JOIN_TYPE, UNION_TYPE_LIST } from '../config';
import CellEdit from './CellEdit';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import SourceDest from './SourceDest';
import Union from './Union';
import Join from './Join';
import Filter from './Filter';
import Aggregate from './Aggregate';
import AddSourceOrDest from '../components/AddSourceOrDest';
import _ from 'lodash';
import Des from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/Des';
import EditFeildsName from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/EditFeildsName';
import 'src/pages/integration/svgIcon.js';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import sheetAjax from 'src/api/worksheet';
import axios from 'axios';
import CellControl from 'worksheet/components/CellControls';
import 'src/pages/worksheet/components/CellControls/CellControls.less';
import { formatControls } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util';

const Wrap = styled.div`
  height: 100%;
  .nodeInfo {
    height: 100%;
    &.isMaxScr {
      position: fixed;
      left: 0;
      bottom: 0;
      top: 0;
      right: 0;
      z-index: 1;
      background: #fff;
    }
  }
  .nodeL {
    height: 100%;
    width: 560px;
    border-right: 1px solid #e8e8e8;
    padding: 20px 24px;
    overflow: auto;
    .desCon {
      margin-top: 14px;
      font-weight: 400;
      color: #9e9e9e;
    }
    .nodeCard {
      // width: 224px;
      height: 72px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 16px 12px;
      .iconCon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        position: relative;
        text-align: center;
        overflow: hidden;
        .iconImg {
          width: 24px;
          height: 24px;
          margin: 0 auto;
        }
        .bg {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          z-index: 0;
          opacity: 0.2;
        }
        .icon {
          z-index: 1;
        }
      }
      .name {
        font-size: 12px;
        font-weight: 400;
        color: #aaaaaa;
        max-width: 150px;
      }
      .des {
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
`;

const WrapR = styled.div`
  padding: 16px 24px 0 16px;
  height: 100%;
  overflow: hidden;
  width: 100%;

  .headCon {
    .icon {
      color: #9e9e9e;
      &:hover {
        color: #2196f3;
      }
    }
  }
  .editControl {
    padding: 6px 16px;
    background: #2196f3;
    border-radius: 4px;
    color: #ffffff;
    font-weight: 400;
    border: 1px solid #2196f3;
    .icon,
    .icon:hover {
      color: #fff;
    }
    &.disable {
      border: 1px solid #bdbdbd;
      color: #bdbdbd;
      background: #fff;
      .icon,
      .icon:hover {
        color: #bdbdbd;
      }
    }
  }
  .previewData {
    padding: 6px 16px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #2196f3;
    color: #2196f3;
    font-weight: 400;
    .icon {
      color: #2196f3;
    }
    &.disable {
      border: 1px solid #bdbdbd;
      color: #bdbdbd;
      background: #fff;
      .icon,
      .icon:hover {
        color: #bdbdbd;
      }
    }
  }
  .tableCon {
    overflow: auto;
    width: 100%;
    .conC {
      width: auto;
      height: auto;
    }
    .itemCon {
      flex-grow: 0;
      flex-shrink: 0;
      width: 200px;
      border-left: 1px solid #eaeaea;
      padding: 0 16px;
      box-sizing: border-box;
      height: 35px;
      line-height: 35px;
      overflow: hidden;
    }
    .tag {
      width: 43px;
      border-left: 0;
    }
    .tableHeader {
      position: sticky;
      top: 0;
      .itemCon {
        background: #f5f5f5;
      }
    }
    .rowCon {
      .itemCon {
        border-top: 1px solid #eaeaea;
      }
    }
  }
`;

export default class EditorCon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxTable: false,
      fieldNames: [],
      rows: [],
      showEditControl: false,
      loading: false,
    };
  }
  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(this.props.node, nextProps.node)) {
      this.setState(
        {
          fieldNames: [],
          rows: [],
          loading: true,
        },
        () => {
          this.setState({
            loading: false,
          });
        },
      );
    }
  }

  isShowMDCell = () => {
    const { node, list } = this.props;
    // const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
    //源节点 且是工作表
    return (
      ['SOURCE_TABLE'].includes(_.get(node, ['nodeType'])) &&
      _.get(node, ['nodeConfig', 'config', 'dsType']) === DATABASE_TYPE.APPLICATION_WORKSHEET
      //   ||
      // //目的地节点 且是工作表 且上个节点也是工作表
      // (['DEST_TABLE'].includes(_.get(node, ['nodeType'])) &&
      //   _.get(node, ['nodeConfig', 'config', 'dsType']) === DATABASE_TYPE.APPLICATION_WORKSHEET &&
      //   _.get(preNode, ['nodeConfig', 'config', 'dsType']) === DATABASE_TYPE.APPLICATION_WORKSHEET)
    );
  };
  //预览节点数据 每次需要手动预览数据
  getNodeDataPreview = () => {
    const { currentProjectId: projectId, flowId, node, list } = this.props;
    const { nodeId } = node;
    this.setState({ loading: true });
    if (this.isShowMDCell()) {
      axios
        .all([
          sheetAjax.getWorksheetInfo({
            worksheetId: _.get(node, 'nodeConfig.config.workSheetId'),
            getTemplate: true,
          }),
          sheetAjax.getFilterRows({
            appId: _.get(node, 'nodeConfig.config.appId'),
            worksheetId: _.get(node, 'nodeConfig.config.workSheetId'),
            pageSize: 100,
            pageIndex: 1,
            getType: 7, //获取表全部数据
          }),
        ])
        .then(res => {
          let fieldNames = (_.get(res[0], 'template.controls') || []).filter(o => {
            let isIn = false;
            (_.get(node, 'nodeConfig.fields') || [])
              .filter(o => o.isCheck)
              .map(it => {
                if (it.oid && it.oid.indexOf(`${res[0].worksheetId}_${o.controlId}`) >= 0) {
                  isIn = true;
                }
              });
            return isIn;
          });
          this.setState({
            fieldNames,
            rows: _.get(res[1], 'data'),
            loading: false,
          });
          if ((_.get(res[0], 'template.controls') || []).length <= 0) {
            alert(_l('相关工作表已删除，或存在异常'), 2);
          }
        });
    } else {
      TaskFlow.nodeDataPreview({
        projectId,
        flowId,
        nodeId,
      }).then(
        res => {
          const { fieldNames = [], rows = [], isSucceeded, errorMsgList, msg } = res || {};
          this.setState({
            fieldNames: fieldNames || [],
            rows: rows || [],
            loading: false,
          });
          if (!isSucceeded && msg) {
            alert(msg, 2);
            return;
          }
          if (!isSucceeded && (errorMsgList || []).length > 0) {
            let str = errorMsgList.join(',');
            alert(str, 2);
          }
        },
        () => {
          this.setState({
            fieldNames: [],
            rows: [],
            loading: false,
          });
          alert(_l('相关工作表已删除，或存在异常'), 2);
        },
      );
    }
  };

  renderCard = nodeData => {
    const defaultInfo = NODE_TYPE_LIST.find(it => it.nodeType === nodeData.nodeType) || {};
    const isAct = ACTION_LIST.map(o => o.type).includes(nodeData.nodeType);
    const {
      iconBgColor,
      dsType,
      unionType = 'UNION',
      joinType = 'INNER_JOIN',
      className,
    } = _.get(nodeData, ['nodeConfig', 'config']) || {};
    if (!isAct && !dsType) {
      return <AddSourceOrDest {...this.props} node={nodeData} height={72} />;
    }
    return (
      <div className={cx('nodeCard Hand flexRow flex', {})}>
        {isAct ? (
          <span className="iconCon flexColumn justifyContentCenter">
            <div className="bg" style={{ backgroundColor: defaultInfo.color }}></div>
            {nodeData.nodeType === 'UNION' ? (
              <div className={cx(`iconImg ${(UNION_TYPE_LIST.find(o => o.type === unionType) || {}).img}`)}></div>
            ) : nodeData.nodeType === 'JOIN' ? (
              <div className={cx(`iconImg ${(JOIN_TYPE.find(o => o.type === joinType) || {}).img}`)}></div>
            ) : (
              <Icon
                className="Font28 flex flexColumn justifyContentCenter"
                style={{ color: defaultInfo.color }}
                type={defaultInfo.icon}
              />
            )}
          </span>
        ) : (
          //源｜目的地 有配置
          <span
            className="iconCon defaultImg flexRow alignItemsCenter justifyContentCenter"
            style={{
              background: iconBgColor,
            }}
          >
            <svg className="icon svg-icon" aria-hidden="true" style={{ width: 18, height: 18 }}>
              <use xlinkHref={`#icon${className}`}></use>
            </svg>
          </span>
        )}
        <div className="flex flexColumn justifyContentCenter mLeft8 overflowHidden">
          <div className="name Bold overflow_ellipsis WordBreak">{nodeData.name || defaultInfo.name}</div>
          {!isAct ? (
            <Des nodeData={nodeData} className="Font14 Gray" />
          ) : (
            <div className={`des overflow_ellipsis WordBreak Font14 Gray`}>{_l('结果')}</div>
          )}
        </div>
      </div>
    );
  };

  renderLCon = () => {
    const { node = {}, list } = this.props;
    const { nodeType = '' } = node;
    const info = {
      ...this.props,
      list,
    };
    switch (nodeType) {
      case 'SOURCE_TABLE':
      case 'DEST_TABLE':
        return (
          <SourceDest
            {...info}
            showEdit={() => {
              this.setState({
                showEditControl: true,
              });
            }}
          />
        );
      case 'UNION':
        return <Union {...info} renderCard={this.renderCard} />;
      case 'JOIN':
        return <Join {...info} renderCard={this.renderCard} />;
      case 'FILTER':
        return <Filter {...info} />;
      case 'AGGREGATE':
        return <Aggregate {...info} />;
    }
  };

  refresh = () => {
    this.getNodeDataPreview();
  };
  renderRCon = () => {
    const { node = {}, list } = this.props;
    const { nodeType = '' } = node;
    const { rows = [], fieldNames = [], maxTable, loading } = this.state;
    let canEditControl = false; //能否编辑字段
    const showMDCell = this.isShowMDCell();

    switch (nodeType) {
      case 'UNION':
      case 'JOIN':
      case 'DEST_TABLE':
      case 'SOURCE_TABLE':
        canEditControl = true;
        break;
      case 'FILTER':
      case 'AGGREGATE':
        canEditControl = false;
        break;
    }
    //筛选|分类汇总 => 没有字段配置
    switch (nodeType) {
      case 'SOURCE_TABLE':
      case 'UNION':
      case 'JOIN':
      case 'FILTER':
      case 'AGGREGATE':
      case 'DEST_TABLE':
        let disable = false;
        let hidePreviwe = false;
        if (['DEST_TABLE', 'SOURCE_TABLE'].includes(nodeType)) {
          let { dsType, tableName, workSheetId, createTable, fieldsMapping } =
            _.get(node, ['nodeConfig', 'config']) || {};
          disable =
            ((dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? !workSheetId : !tableName) && !createTable) || //选择已已有，未配置表
            (createTable && (fieldsMapping.length <= 0 || !tableName)); //选择新建，未设置名称或映射
        }
        //没有设置筛选条件|筛选条件错误，不可预览
        if (['FILTER'].includes(nodeType)) {
          const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
          let relateControls = formatControls(_.get(preNode, ['nodeConfig', 'fields']) || []).filter(o => o.isCheck); //过滤掉未勾选的字段

          let items = _.get(node, ['nodeConfig', 'config', 'items']) || [];
          let data = [];
          (items || []).map(o => {
            if (!!o.isGroup) {
              data = [...data, ...o.groupFilters];
            } else {
              data = [...data, o];
            }
          });
          items = data.filter(o => !!o && !!relateControls.find(it => it.controlId === o.controlId));
          if (items.length <= 0 || items.length !== data.length) {
            disable = true;
          }
        }
        if (['JOIN'].includes(nodeType)) {
          const { leftTableId, rightTableId } = _.get(node, ['nodeConfig', 'config']) || {};
          const leftT = list.find(o => o.nodeId === leftTableId) || {};
          const rightT = list.find(o => o.nodeId === rightTableId) || {};
          const leftFieldNames = (_.get(leftT, 'nodeConfig.fields') || []).filter(o => !!o.isCheck);
          const rightFieldNames = (_.get(rightT, 'nodeConfig.fields') || []).filter(o => !!o.isCheck);
          if (leftFieldNames.length <= 0 || rightFieldNames.length <= 0) {
            //上游两个节点都没有fields
            disable = true;
          }
          const { conditions = [] } = _.get(node, 'nodeConfig.config');
          if (!conditions || (conditions || []).length <= 0) {
            //未配置相关连接条件
            disable = true;
          } else {
            (conditions || []).map(o => {
              const { leftField, rightField } = o;
              if (
                !leftFieldNames.find(it => it.id === leftField.id) ||
                !rightFieldNames.find(it => it.id === rightField.id)
              ) {
                //存在报错的条件
                disable = true;
              }
            });
          }
        }
        if (['DEST_TABLE', 'FILTER', 'JOIN', 'AGGREGATE'].includes(nodeType)) {
          //数据筛选节点、多表连接节点、数据目的地、分类汇总节点的预览功能 暂时不上数据预览
          hidePreviwe = true;
        }

        return (
          <WrapR className={cx('flexColumn')}>
            <div className="headCon flexRow alignItemsCenter">
              <span className="Gray_9e flex flexRow alignItemsCenter">
                {!['DEST_TABLE', 'JOIN'].includes(nodeType)
                  ? _l('仅预览前100行数据')
                  : _l('预览数据仅显示从数据源同步至当前节点时的前100行记录')}
                {!['SOURCE_TABLE'].includes(nodeType) && (
                  <Tooltip
                    text={_l('由于预览数据基于流式实时传输，显示的数据可能与实际入库的数据部分不一致，仅供参考')}
                    popupPlacement="top"
                  >
                    <Icon icon="info1" className="Gray_bd mLeft5 Font18" />
                  </Tooltip>
                )}
              </span>
              {(rows.length > 0 || fieldNames.length > 0) && canEditControl && (
                <span
                  className={cx('editControl flexRow alignItemsCenter mRight10', { disable, Hand: !disable })}
                  onClick={() => {
                    if (disable) {
                      return;
                    }
                    this.setState({
                      showEditControl: true,
                    });
                  }}
                >
                  <i className="icon icon-storage  Hand Font16 mRight5"></i>
                  {_l('字段配置')}
                </span>
              )}
              {(rows.length > 0 || fieldNames.length > 0) && (
                <span
                  className={cx('previewData flexRow alignItemsCenter', disable || hidePreviwe ? 'disable' : 'Hand')}
                  onClick={() => {
                    if (disable || hidePreviwe) {
                      return;
                    }
                    this.refresh();
                  }}
                >
                  <i className="icon icon-refresh1 Hand Font16 mRight5"></i>
                  {_l('预览数据')}
                </span>
              )}
              <i
                className={`icon  Hand Font20 mLeft10 ${maxTable ? 'icon-close_fullscreen' : 'icon-open_in_full'}`}
                onClick={() => {
                  this.setState({ maxTable: !maxTable });
                }}
              ></i>
              <i
                className="icon icon-close  Hand Font20 mLeft10"
                onClick={() => {
                  this.props.onClose();
                }}
              ></i>
            </div>
            <div className="tableCon mTop10 flex">
              <div className="conC">
                {fieldNames.length > 0 && (
                  <div className="tableHeader flexRow">
                    <div className="tag flexRow alignItemsCenter itemCon InlineBlock">#</div>
                    {fieldNames.map(o => {
                      return (
                        <div className="itemCon flexRow alignItemsCenter InlineBlock">
                          <EditFeildsName
                            title={showMDCell ? o.controlName : o}
                            // canEdit
                            onChangeName={name => {
                              this.setState({
                                fieldNames: fieldNames.map(it => {
                                  if (it === o) {
                                    return name;
                                  } else {
                                    return it;
                                  }
                                }),
                                rows: rows.map(it => {
                                  return { ..._.omit(it, [o]), [name]: it[o] };
                                }),
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                {loading ? (
                  <LoadDiv />
                ) : rows.length <= 0 && fieldNames.length <= 0 ? (
                  <div className="flexRow justifyContentCenter mTop80">
                    {canEditControl && (
                      <span
                        className={cx('editControl flexRow alignItemsCenter mRight12', {
                          disable,
                          Hand: !disable,
                        })}
                        onClick={() => {
                          if (disable) {
                            return;
                          }
                          this.setState({
                            showEditControl: true,
                          });
                        }}
                      >
                        <i className="icon icon-storage  Hand Font16 mRight5"></i>
                        {_l('字段配置')}
                      </span>
                    )}
                    <span
                      className={cx(
                        'previewData flexRow alignItemsCenter',
                        disable || hidePreviwe ? 'disable' : 'Hand',
                      )}
                      onClick={() => {
                        if (disable || hidePreviwe) {
                          return;
                        }
                        this.refresh();
                      }}
                    >
                      <i className="icon icon-refresh1 Hand Font16 mRight5"></i>
                      {_l('预览数据')}
                    </span>
                  </div>
                ) : (
                  <React.Fragment>
                    {rows.map((o, i) => {
                      return (
                        <div className="rowCon flexRow">
                          <div className="tag flexRow alignItemsCenter itemCon InlineBlock">{i + 1}</div>
                          {fieldNames.map(item => {
                            if (showMDCell) {
                              return (
                                <div className="itemCon">
                                  <CellControl
                                    cell={{ ...item, value: o[item.controlId] }}
                                    worksheetId={_.get(node, 'nodeConfig.config.workSheetId')}
                                    row={{ rowid: o.rowid }}
                                    isCharge={false}
                                  />
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  className="itemCon flexRow alignItemsCenter InlineBlock"
                                  dangerouslySetInnerHTML={{ __html: o[item] }}
                                ></div>
                              );
                            }
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                )}
              </div>
            </div>
          </WrapR>
        );
    }
  };
  render() {
    const { onUpdate } = this.props;
    const { maxTable, showEditControl } = this.state;
    return (
      <Wrap className="flexRow">
        <div className="nodeL">{this.renderLCon()}</div>
        <div className={cx('nodeInfo flex overflowHidden', { isMaxScr: maxTable })}>{this.renderRCon()}</div>
        {showEditControl && (
          <CellEdit
            {...this.props}
            onClose={() => {
              this.setState({
                showEditControl: false,
              });
            }}
            onSave={node => {
              this.setState(
                {
                  showEditControl: false,
                },
                () => {
                  onUpdate(node);
                },
              );
            }}
          />
        )}
      </Wrap>
    );
  }
}
