import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import cx from 'classnames';
import { Icon, Input } from 'ming-ui';
import { NODE_TYPE_LIST, ACTION_LIST, JOIN_TYPE, FILTER_RELATION_TYPE_DATA, UNION_TYPE_LIST } from '../config';
import { FILTER_RELATION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import CellEdit from './CellEdit';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import SourceDest from './SourceDest';
import Union from './Union';
import Join from './Join';
import Filter from './Filter';
import Aggregate from './Aggregate';
import AddSourceOrDest from '../components/AddSourceOrDest';
import _ from 'lodash';
import Des from 'src/pages/integration/containers/TaskCon/TaskCanvas/components/Des';
import EditFeildsName from 'src/pages/integration/containers/TaskCon/TaskCanvas/components/EditFeildsName';
import 'src/pages/integration/svgIcon.js';
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
  }
  .previewData {
    padding: 6px 16px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #2196f3;
    color: #2196f3;
    font-weight: 400;
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
      node: props.node,
      isAddSheet: false,
      maxTable: false,
      fieldNames: [],
      rows: [],
      showEditControl: false,
    };
  }
  componentDidMount() {
    const { node } = this.props;
    const fieldNames = (_.get(node, ['nodeConfig', 'fields']) || []).map(o => o.name);
    this.setState({
      node,
      fieldNames,
    });
    // this.getNodeDataPreview();
  }
  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(this.props.node, nextProps.node)) {
      this.setState({
        node: nextProps.node,
        fieldNames: [],
        rows: [],
      });
      // this.getNodeDataPreview();
    }
  }

  //预览节点数据 每次需要手动预览数据
  getNodeDataPreview = () => {
    const { currentProjectId: projectId, flowId, node } = this.props;
    const { nodeId } = node;
    TaskFlow.nodeDataPreview({
      projectId,
      flowId,
      nodeId,
    }).then(res => {
      const { fieldNames = [], rows = [] } = res || {};
      this.setState({
        fieldNames,
        rows,
      });
    });
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
    const { isAddSheet } = this.state;
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
            isAddSheet={isAddSheet}
            addSheet={() => {
              this.setState({
                isAddSheet: true,
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
    const { node = {} } = this.props;
    const { nodeType = '' } = node;
    const { rows = [], fieldNames = [], maxTable } = this.state;
    let canEditControl = false; //能否编辑字段
    switch (nodeType) {
      case 'UNION':
      case 'JOIN':
      case 'DEST_TABLE':
      case 'SOURCE_TABLE':
        if ((_.get(node, ['nodeConfig', 'fields']) || []).length > 0 || fieldNames.length > 0) {
          // canEditControl = true;
        }
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
        return (
          <WrapR className={cx('flexColumn')}>
            <div className="headCon flexRow alignItemsCenter">
              <span className="Gray_9e flex">{_l('仅预览前100行数据')}</span>
              {rows.length > 0 && canEditControl && (
                <span
                  className="editControl Hand flexRow alignItemsCenter"
                  onClick={() => {
                    this.setState({
                      showEditControl: true,
                    });
                  }}
                >
                  <i className="icon icon-storage  Hand Font16 mRight5"></i>
                  {_l('字段配置')}
                </span>
              )}
              {/* <i
                className="icon icon-refresh1  Hand Font20 mLeft15"
                onClick={() => {
                  this.refresh();
                }}
              ></i> */}
              {/* <i
                className={`icon  Hand Font20 mLeft10 ${maxTable ? 'icon-close_fullscreen' : 'icon-open_in_full'}`}
                onClick={() => {
                  this.setState({ maxTable: !maxTable });
                }}
              ></i> */}
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
                            title={o}
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
                {rows.length <= 0 ? (
                  <div className="flexRow justifyContentCenter mTop80">
                    <p className="TxtCenter Gray_9e Font17">{_l('即将上线')}</p>
                    {/* {canEditControl && (
                      <span
                        className="editControl Hand flexRow alignItemsCenter mRight12"
                        onClick={() => {
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
                      className="previewData Hand flexRow alignItemsCenter"
                      onClick={() => {
                        this.refresh();
                      }}
                    >
                      {_l('预览数据')}
                    </span> */}
                  </div>
                ) : (
                  <React.Fragment>
                    {rows.map((o, i) => {
                      return (
                        <div className="rowCon flexRow">
                          <div className="tag flexRow alignItemsCenter itemCon InlineBlock">{i + 1}</div>
                          {fieldNames.map(item => {
                            return <div className="itemCon flexRow alignItemsCenter InlineBlock">{o[item]}</div>;
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
    const { maxTable, showEditControl, isAddSheet } = this.state;
    return (
      <Wrap className="flexRow">
        <div className="nodeL">{this.renderLCon()}</div>
        <div className={cx('nodeInfo flex overflowHidden', { isMaxScr: maxTable })}>{this.renderRCon()}</div>
        {showEditControl && (
          <CellEdit
            {...this.props}
            isAddSheet={isAddSheet}
            onClose={() => {
              this.setState({
                showEditControl: false,
              });
            }}
            onSave={node => {
              if (isAddSheet) {
                this.setState({
                  showEditControl: false,
                });
              } else {
                onUpdate(node);
                this.setState({
                  showEditControl: false,
                });
              }
            }}
          />
        )}
      </Wrap>
    );
  }
}
