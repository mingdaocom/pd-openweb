import React, { Component } from 'react';
import { LoadDiv, Dialog } from 'ming-ui';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import styled from 'styled-components';
// import ToolBar from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/ToolBar';
import EditCon from './EditCon/index.jsx';
import TaskNode from './TaskNode';
import { formatTaskNodeData, formatDataWithLine } from './util';
import _ from 'lodash';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import './style.less';
const Wrap = styled.div`
  &.taskContainer {
    .ContainerCon {
      position: relative;
      overflow: auto;
      height: 100%;
      width: auto;
    }
  }
`;
const TableTreeWrap = styled.div`
  position: relative;
  transform-origin: left top;
  margin: 50px 40px;
  z-index: 1;
  transform: ${props => (props.scale ? `scale(${props.scale / 100})` : 'scale(1)')};
`;
const WrapEdit = styled.div`
  height: 395px;
  background: #ffffff;
  border-top: 1px solid #e8e8e8;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;
class TaskCanvas extends Component {
  constructor(props) {
    super(props);
    const { flowData = {}, flowId } = props;
    const { flowNodes, firstNodeId } = flowData;
    this.state = {
      loading: true,
      scale: 100,
      currentId: '',
      flowId,
      firstNodeId,
      flowNodes,
      list: [],
      flowData,
    };
  }

  componentDidMount() {
    const { flowData = {}, flowId } = this.props;
    const { flowNodes, firstNodeId } = flowData;
    this.setState({
      flowNodes,
      firstNodeId,
      loading: false,
      flowId,
      list: formatDataWithLine(formatTaskNodeData(_.values(flowNodes), firstNodeId)),
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.curId) {
      this.setState({
        currentId: nextProps.curId,
      });
    }
    if (!_.isEqual(nextProps.flowData.flowNodes, this.props.flowData.flowNodes)) {
      const { flowData = {} } = nextProps;
      const { flowNodes, firstNodeId } = flowData;
      this.setState({
        flowNodes,
        list: formatDataWithLine(formatTaskNodeData(_.values(flowNodes), firstNodeId)),
        loading: false,
      });
    }
  }

  //删除节点
  deleteNode = nodeId => {
    const { currentProjectId: projectId } = this.props;
    const { flowId = '' } = this.state;
    TaskFlow.deleteNode({
      projectId,
      flowId,
      nodeId,
    }).then(res => {
      this.setState({
        currentId: '',
      });
      this.onCompute(res);
    });
  };
  //计算更新后的数据
  onCompute = data => {
    const { flowNodes } = this.state;
    const { toAdd = [], toUpdate = [], toDeleteIds = [], srcIsDb } = data;
    const updateIds = (toUpdate || []).map(o => o.nodeId);
    let map = _.omit(flowNodes, updateIds);
    map = _.omit(map, toDeleteIds || []);
    [...(toUpdate || []), ...(toAdd || [])].map(o => {
      map[o.nodeId] = o;
    });
    _.mapKeys(map, o => {
      map[o.nodeId] = _.omit(o, ['x', 'y']);
    });
    this.setState(
      {
        loading: true,
      },
      () => {
        this.props.onUpdate({ ...this.props.flowData, flowNodes: map, srcIsDb });
        this.setState({
          loading: false,
        });
      },
    );
  };

  //更新节点信息
  updateNode = (node, forName) => {
    const { currentProjectId: projectId } = this.props;
    const { flowId = '' } = this.state;
    const { nodeId, name, nodeType, nodeConfig } = node;
    if (forName) {
      TaskFlow.renameNode({
        projectId,
        flowId,
        nodeId,
        name,
      }).then(res => {
        const { srcIsDb } = res;
        this.onCompute({
          toUpdate: [node],
          toAdd: [],
          toDeleteIds: [],
          srcIsDb,
        });
      });
      return;
    }
    TaskFlow.updateNode({
      projectId,
      flowId,
      nodeId,
      name,
      nodeType,
      nodeConfig,
    }).then(res => {
      const { errorMsg, errorMsgList, isSucceeded, toAdd, toDeleteIds, toUpdate, srcIsDb } = res;
      this.onCompute({
        toUpdate: !!toUpdate
          ? !toUpdate.find(o => o.nodeId === node.nodeId)
            ? [...toUpdate, node]
            : toUpdate
          : [node],
        toAdd: !!toAdd ? toAdd : [],
        toDeleteIds: !!toDeleteIds ? toDeleteIds : [],
        srcIsDb,
      });
      if (!isSucceeded && errorMsgList) {
        return Dialog.confirm({
          title: _l('报错信息'),
          className: 'connectorErrorDialog',
          description: (
            <div className="errorInfo" style={{ marginBottom: -30 }}>
              {errorMsgList.map((error, index) => {
                return (
                  <div key={index} className="mTop5">
                    {error}
                  </div>
                );
              })}
            </div>
          ),
          removeCancelBtn: true,
          okText: _l('关闭'),
        });
      }
    });
  };
  genScreenshot = () => {
    const $wrap = document.querySelector('.treeContainerCon');
    const height = $wrap.scrollHeight + 100;
    const width = $wrap.scrollWidth + 50;
    let copyDom = $wrap.cloneNode(true);
    copyDom.style.width = width;
    copyDom.style.height = height;
    document.querySelector('body').appendChild(copyDom);
    const name = 'scrennshot' + '.png';
    try {
      domtoimage.toBlob(copyDom, { bgcolor: '#f5f5f5', width: width, height: height }).then(function (blob) {
        saveAs(blob, name);
        document.querySelector('body').removeChild(copyDom);
      });
    } catch (error) {
      alert(_l('生成失败'), 2);
      document.querySelector('body').removeChild(copyDom);
    }
  };
  handleToolClick = (type, obj) => {
    if (type === 'genScreenshot') {
      this.genScreenshot();
    }
    if (type === 'toOrigin') {
      const $wrap = _.get(this.$wrap, 'current');
      $wrap.scrollLeft = 0;
      $wrap.scrollTop = 0;
    }
    if (type === 'adjustScale') {
      this.setState({ scale: obj.scale });
    }
  };

  closeEdit = () => {
    const { currentId } = this.state;
    if (!!currentId) {
      this.setState({
        currentId: '',
      });
    }
  };

  render() {
    const { loading, scale, list, currentId, firstNodeId, flowNodes } = this.state;
    return (
      <Wrap className="taskContainer Relative flex">
        <div
          className="ContainerCon"
          onClick={() => {
            this.closeEdit();
          }}
        >
          <TableTreeWrap
            scale={scale}
            className="treeContainerCon"
            onClick={() => {
              this.closeEdit();
            }}
          >
            {loading ? (
              <LoadDiv />
            ) : (
              list.map(o => {
                return (
                  <TaskNode
                    {...this.props}
                    onChangeCurrentNode={currentId => {
                      this.setState({
                        currentId,
                      });
                    }}
                    currentId={currentId}
                    nodeData={o}
                    nodes={flowNodes}
                    list={list}
                    onDelete={() => {
                      this.deleteNode(o.nodeId);
                    }}
                    onUpdate={(node, forName) => {
                      this.updateNode(
                        {
                          ...node,
                          status: 'NORMAL',
                        },
                        forName,
                      );
                    }}
                    key={o.nodeId}
                    onAddNodes={data => {
                      this.onCompute(data);
                    }}
                  />
                );
              })
            )}
          </TableTreeWrap>
        </div>
        {/* 暂时不开放 */}
        {/* <ToolBar scale={scale} onClick={this.handleToolClick} isOpenEdit={currentId !== ''} /> */}
        {currentId !== '' && (
          <WrapEdit className="editTaskNodes">
            <EditCon
              {...this.props}
              onChangeCurrentNode={currentId => {
                this.setState({
                  currentId,
                });
              }}
              node={list.find(o => o.nodeId === currentId)}
              nodeList={flowNodes}
              list={list}
              flowId={this.state.flowId}
              onClose={() => {
                this.closeEdit();
              }}
              onUpdate={node => {
                if (currentId !== node.nodeId) {
                  this.setState({
                    currentId: node.nodeId,
                  });
                }
                this.updateNode({
                  ...node,
                  status: 'NORMAL',
                });
              }}
            />
          </WrapEdit>
        )}
      </Wrap>
    );
  }
}

export default TaskCanvas;
