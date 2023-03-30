import React, { Component, createElement } from 'react';
import { Icon, LoadDiv, Support, WaterMark, Tooltip, Dialog } from 'ming-ui';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import styled from 'styled-components';
import ToolBar from 'src/pages/integration/containers/TaskCon/TaskCanvas/components/ToolBar';
import EditCon from './EditCon.jsx';
import TaskNode from './TaskNode';
import { formatTaskNodeData, formatDataWithLine } from './util';
import { tW, tH, tLine, tBottom } from './config';
import _ from 'lodash';
import './style.less';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import { v4 as uuidv4 } from 'uuid';
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

const initData = {
  '070b9e3fd75544eb92e06b4f4687a198': {
    nodeId: '070b9e3fd75544eb92e06b4f4687a198',
    nodeType: 'SOURCE_TABLE',
    name: '读取数据源',
    nextIds: ['070b9e3fd75544eb92e06b4f4687a199'],
    prevIds: [],
    config: {},
  },
  '070b9e3fd75544eb92e06b4f4687a199': {
    nodeId: '070b9e3fd75544eb92e06b4f4687a199',
    nodeType: 'DEST_TABLE',
    name: '写入数据目的地',
    nextIds: [],
    prevIds: [],
    config: {},
  },
};
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
      // const { toAdd, toUpdate, toDeleteIds = [] } = res;
      this.onCompute(res);
    });
  };
  //计算更新后的数据
  onCompute = data => {
    const { firstNodeId, flowNodes } = this.state;
    const { toAdd = [], toUpdate = [], toDeleteIds = [] } = data;
    let a = _.cloneDeep(formatTaskNodeData(_.values(flowNodes), firstNodeId));
    const updateIds = toUpdate.map(o => o.nodeId);
    a = a.filter(o => ![...updateIds, ...toDeleteIds].includes(o.nodeId)).concat([...toAdd, ...toUpdate]);
    console.log(a);
    let map = {};
    a.forEach(row => {
      map[row.nodeId] = row;
    });
    this.props.onUpdate({ ...this.props.flowData, flowNodes: map });
    this.setState(
      {
        list: formatDataWithLine(formatTaskNodeData(a, firstNodeId)),
        loading: true,
        flowNodes: map,
      },
      () => {
        this.setState({
          loading: false,
        });
      },
    );
  };

  //更新节点信息
  updateNode = node => {
    const { currentProjectId: projectId, onUpdate } = this.props;
    const { flowId = '', list = [] } = this.state;
    const { nodeId, name, nodeType, nodeConfig } = node;
    // TaskFlow.updateNode({
    //   projectId,
    //   flowId,
    //   nodeId,
    //   name,
    //   nodeType,
    //   // status: 'NORMAL',
    //   // description: 'm52di3',
    //   nodeConfig,
    // }).then(res => {
    //   this.onCompute(res);
    // });
    this.setState({
      list: list.map(o => {
        if (o.nodeId === node.nodeId) {
          return node;
        } else {
          return o;
        }
      }),
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
    if (loading) {
      return <LoadDiv />;
    }
    console.log(this.state.list);
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
            {list.map(o => {
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
                  onUpdate={node => {
                    this.updateNode(node);
                  }}
                  onAddNodes={data => {
                    this.onCompute(data);
                  }}
                />
              );
            })}
          </TableTreeWrap>
        </div>
        {/* <ToolBar scale={scale} onClick={this.handleToolClick} isOpenEdit={currentId !== ''} /> */}
        {currentId !== '' && (
          <WrapEdit className="editTaskNodes">
            <EditCon
              {...this.props}
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
                this.updateNode(node);
              }}
            />
          </WrapEdit>
        )}
      </Wrap>
    );
  }
}

export default TaskCanvas;
