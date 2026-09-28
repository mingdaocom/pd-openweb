import React, { Component, createRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import SVG from 'svg.js';
import { Icon, UpgradeIcon } from 'ming-ui';
import { Dropdown, Popover } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import { Circle } from 'worksheet/styled';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import ChangeName from 'src/pages/integration/components/ChangeName';
import Avator from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/Avator';
import Des from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/Des';
import { getNodeName } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util.js';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import { ACTION_LIST, NODE_TYPE_LIST, tBottom, tH, tLine, tW } from './config';

const ClickAwayable = ClickAway;
const Wrap = styled.div`
  position: absolute;
  height: auto;
  width: auto;
  min-width: ${tW + tLine / 2}px; //220px 右padding 30
  .delNodeBox {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .nodeTask {
    width: ${tW}px;
    // 线60
    height: ${tH}px;
    border-radius: 6px;
    background: var(--color-background-primary);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s ease-out;
    overflow: hidden;
    padding: 0 12px 0 0;
    &.isCurrent {
      box-shadow:
        0 1px 2px rgba(33, 150, 243, 0.16),
        0 2px 6px rgba(33, 150, 243, 0.5);
    }
    &.isErr {
      border: 1px solid var(--color-error);
    }
    .moreOperate {
      opacity: 0;
    }
    &:hover {
      .moreOperate {
        opacity: 1;
      }
    }
  }
  .svgCon {
    position: absolute;
    min-width: ${tLine}px;
    min-height: ${tH}px;
    z-index: 0;
  }
`;

export const AddNode = styled(Circle)`
  background-color: var(--color-background-primary);
  justify-content: center;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  margin-left: 4px;
  z-index: 1;
  .icon {
    font-size: 18px;
    color: var(--color-text-tertiary);
    transition: transform 0.25s;
    &:hover {
      color: var(--color-primary);
      transform: rotate(90deg);
    }
  }
`;
const WrapAct = styled.div`
  min-width: 160px;
  background: var(--color-background-primary);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  padding: 6px 0;
  li {
    padding: 0 16px;
    height: 36px;
    i {
      width: 24px;
    }
    &:hover {
      background: var(--color-background-hover);
    }
  }
  .line {
    margin: 6px 0;
    width: 100%;
    border-top: 1px solid var(--color-border-primary);
  }
`;
const MoreOperate = styled.span`
  cursor: pointer;
  text-align: center;
  border-radius: 3px;
  line-height: 24px;
  display: inline-block;
  width: 24px;
  height: 24px;
  color: var(--color-text-tertiary);
  font-size: 18px;
  &:hover {
    background-color: var(--color-background-secondary);
    color: var(--color-primary);
  }
`;
const DelNode = styled.div`
  font-weight: 400;
  width: 320px;
  background: var(--color-background-primary);
  box-shadow: 0px 3px 6px rgb(0 0 0 / 16%);
  position: absolute;
  padding: 24px 20px 16px;
  left: 0;
  top: 64px;
  z-index: 10;
  box-sizing: border-box;
  margin-left: -50px;
  border-radius: 3px;
  .trangle {
    position: absolute;
    left: 50%;
    top: -11px;
    transform: translate(-50%, 0);
    width: 0px;
    height: 0px;
    border: 6px solid #000;
    border-top-color: transparent;
    border-bottom-color: var(--color-background-primary);
    border-left-color: transparent;
    border-right-color: transparent;
  }
  .cancel,
  .onDel {
    margin-top: 20px;
    padding: 8px 20px;
    display: inline-block;
    border-radius: 3px;
    &.onDel {
      background: var(--color-error);
      color: var(--color-white);
    }
  }
  .cover {
    position: fixed;
    left: 0;
    top: 0;
    background: var(--color-text-placeholder);
  }
`;

class TaskNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      popupVisible: false,
      showChangeName: false,
      showDel: false,
    };
    this.$itemWrap = createRef(null);
  }
  componentDidMount() {
    this.drawConnector();
  }
  //新增节点

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (
        !_.isEqual(_.get(this.props, 'nodeData.pathIds'), _.get(prevProps, 'nodeData.pathIds')) &&
        _.isEqual(_.get(this.props, 'nodeData.nodeId'), _.get(prevProps, 'nodeData.nodeId'))
      ) {
        this.drawConnector(this.props);
      }
    }
  }

  //新增节点
  onAddNode = info => {
    const { currentProjectId: projectId, flowId, onAddNodes } = this.props;
    const { name, upstreamId, isOnTrunk, nodeType } = info;
    TaskFlow.addNode({
      projectId,
      flowId,
      upstreamId, //上游节点id
      name,
      nodeType, //节点类型(See: 节点类型)
      isOnTrunk, //新增的是否是主干上的节点
    }).then(res => {
      if (res.failed) {
        alert(res.errorMsg, 2);
        this.setState({ visible: false });
        return;
      }

      onAddNodes(res);
      this.setState({ visible: false });
    });
  };

  renderPopup = () => {
    const { nodeData, currentProjectId } = this.props;
    const { pathIds = [], nodeId, y } = nodeData;

    if (pathIds.length <= 0) {
      return;
    }

    const featureType = getFeatureStatus(currentProjectId, VersionProductType.dataIntegrationETL);

    return (
      <WrapAct>
        <ul>
          {ACTION_LIST.map(o => {
            return (
              <React.Fragment key={o.type}>
                <li
                  className={'flexRow alignItemsCenter Hand'}
                  onClick={() => {
                    //公有云的旗舰版可用
                    if (featureType === '2') {
                      buriedUpgradeVersionDialog(currentProjectId, VersionProductType.dataIntegrationETL);
                      return;
                    }

                    this.onAddNode({
                      name: NODE_TYPE_LIST.find(a => a.nodeType === o.type).name,
                      nodeType: o.type,
                      upstreamId: nodeId,
                      isOnTrunk: y <= 0,
                    });
                  }}
                >
                  <Icon type={o.icon} style={{ color: o.color }} className="Font17" />
                  <span className="Font14">{o.txt}</span>
                  {featureType === '2' && <UpgradeIcon />}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </WrapAct>
    );
  };

  // 绘制连接线
  drawConnector = nextProps => {
    const { nodeData } = nextProps || this.props;
    const { pathIds } = nodeData;
    let yN = 0;

    if (pathIds.length > 0) {
      yN = pathIds[0].fromDt.y - pathIds[0].toDt.y;
      const id = `svg-${pathIds[0].fromDt.nodeId}-${pathIds[0].toDt.nodeId}`;
      const $svgWrap = document.getElementById(id);

      if (!$svgWrap) {
        return;
      }

      if ($svgWrap.childElementCount > 0) {
        $svgWrap.childNodes.forEach(child => $svgWrap.removeChild(child));
      }

      const draw = SVG(id).size('100%', '100%');
      let linePath = [];

      if (yN === 0) {
        linePath = ['M', 0, tH / 2, 'L', $($svgWrap).width(), tH / 2].join(' ');
      } else {
        //目前就两种情况的线，向上和平行
        let fL = 0;
        let fT = yN > 0 ? $($svgWrap).height() - tH / 2 : tH / 2;
        let tT = yN < 0 ? $($svgWrap).height() - tH / 2 : tH / 2;
        let tL = $($svgWrap).width();
        let mL = yN > 0 ? $($svgWrap).width() : 0;
        let mT = yN > 0 ? $($svgWrap).height() - tH / 2 : 0;
        linePath = ['M', fL, fT, 'S', mL, mT, tL, tT].join(' ');
      }

      draw.path(linePath).stroke({ width: 2, color: '#d3d3d3' }).fill('none');
    }
  };
  renderDel = () => {
    const { onDelete } = this.props;
    return (
      <ClickAwayable
        className="delNodeBox"
        onClickAway={() => this.setState({ showDel: false })}
        onClick={e => e.stopPropagation()}
      >
        <DelNode>
          <div className="trangle"></div>
          <span className="Red Font14">{_l('同时删除分支下所有节点')}</span>
          <div className="TxtRight">
            <span
              className="cancel Hand"
              onClick={() => {
                this.setState({
                  showDel: false,
                });
              }}
            >
              {_l('取消')}
            </span>
            <span
              className="onDel Hand mLeft20"
              onClick={() => {
                onDelete();
                this.setState({
                  showDel: false,
                });
              }}
            >
              {_l('确定')}
            </span>
          </div>
        </DelNode>
      </ClickAwayable>
    );
  };

  render() {
    const { nodeData = {}, currentId, onChangeCurrentNode, onUpdate, flowData, currentProjectId } = this.props;
    const { visible, popupVisible, showChangeName, showDel } = this.state;
    let yN = 0;
    let svgH = 0;
    let svgW = 0;

    if (nodeData.pathIds.length > 0) {
      yN = nodeData.pathIds[0].fromDt.y - nodeData.pathIds[0].toDt.y;
      svgH = Math.abs(yN) * (tBottom + tH) + tH;
      svgW =
        Math.abs(nodeData.pathIds[0].fromDt.x - nodeData.pathIds[0].toDt.x) * tLine +
        (Math.abs(nodeData.pathIds[0].fromDt.x - nodeData.pathIds[0].toDt.x) - 1) * tW;
    }

    const isAct = ACTION_LIST.map(o => o.type).includes(nodeData.nodeType);
    const featureType = getFeatureStatus(currentProjectId, VersionProductType.dataIntegrationETL);

    return (
      <Wrap
        className="flexRow alignItemsCenter"
        id={nodeData.nodeId}
        style={{ left: nodeData.x * (tW + tLine), top: nodeData.y * (tH + tBottom) }}
        ref={this.$itemWrap}
      >
        <div
          className={cx('nodeTask Hand flexRow alignItemsCenter', {
            isCurrent: currentId === nodeData.nodeId,
            isErr: nodeData.status !== 'NORMAL',
          })}
          id={nodeData.nodeId}
          onClick={e => {
            onChangeCurrentNode(nodeData.nodeId);
            e.stopPropagation();
          }}
        >
          <Avator nodeData={nodeData} />
          <div className="flex flexColumn justifyContentCenter mLeft8 overflowHidden">
            {nodeData.isDel && <div className="name Font13 Bold overflow_ellipsis WordBreak Red">{_l('源已删除')}</div>}
            {/* 错误提示 */}
            <div className="name Font13 Bold overflow_ellipsis WordBreak">{getNodeName(flowData, nodeData)}</div>
            {isAct ? (
              <Des nodeData={nodeData} className="Font12 textTertiary" showEdit />
            ) : (
              <Des nodeData={nodeData} className="Font12 textTertiary" />
            )}
          </div>

          {!['DEST_TABLE', 'SOURCE_TABLE'].includes(nodeData.nodeType) && (
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              getPopupContainer={() => document.body}
              open={popupVisible}
              onOpenChange={popupVisible => {
                this.setState({ popupVisible });
              }}
              menu={{
                style: { width: 200 },
                items: [
                  {
                    key: 'rename',
                    icon: <Icon icon="edit" className="Font17" />,
                    label: _l('重命名'),
                    onClick: ({ domEvent }) => {
                      this.setState({ popupVisible: false, showChangeName: true });
                      domEvent.stopPropagation();
                    },
                  },
                  !['DEST_TABLE', 'SOURCE_TABLE'].includes(nodeData.nodeType) && {
                    key: 'delete',
                    danger: true,
                    icon: <Icon icon="trash" className="Font17" />,
                    label: _l('删除'),
                    onClick: ({ domEvent }) => {
                      this.setState({ popupVisible: false, showDel: true });
                      domEvent.stopPropagation();
                    },
                  },
                ].filter(Boolean),
              }}
            >
              <MoreOperate
                className="moreOperate mTop3"
                style={popupVisible ? { display: 'inline-block' } : {}}
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                <i className="icon icon-more_horiz"></i>
              </MoreOperate>
            </Dropdown>
          )}
        </div>
        {/*目的地后不能添加操作 */}
        {nodeData.nodeType !== 'DEST_TABLE' && !!featureType && (
          <Popover
            noPadding
            open={visible}
            trigger="click"
            content={this.renderPopup()}
            getPopupContainer={() => document.body}
            onOpenChange={visible => {
              this.setState({ visible });
            }}
            placement="bottomLeft"
          >
            <AddNode size={24} className="addNode">
              <i className="icon icon-add" />
            </AddNode>
          </Popover>
        )}
        {nodeData.pathIds.length > 0 && (
          <div
            className="svgCon"
            id={`svg-${nodeData.pathIds[0].fromDt.nodeId}-${nodeData.pathIds[0].toDt.nodeId}`}
            style={{
              left: tW,
              width: svgW,
              height: svgH,
              top: yN === 0 ? 0 : 'initial',
              bottom: yN >= 0 ? 0 : 'initial',
            }}
          ></div>
        )}
        {showChangeName && (
          <ChangeName
            name={nodeData.name}
            onCancel={() => {
              this.setState({
                showChangeName: false,
              });
            }}
            onChange={name => {
              onUpdate({ ...nodeData, name }, true);
              this.setState({
                showChangeName: false,
              });
            }}
          />
        )}
        {showDel && this.renderDel()}
      </Wrap>
    );
  }
}

export default TaskNode;
