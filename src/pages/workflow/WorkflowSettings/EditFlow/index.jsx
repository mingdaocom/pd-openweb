import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import './index.less';
import nodeModules from './nodeModules';
import End from './End';
import CreateNodeDialog from './components/CreateNodeDialog';
import Detail from '../Detail';
import cx from 'classnames';
import { Dialog, LoadDiv, EditingBar } from 'ming-ui';
import { getSameLevelIds } from '../utils';
import { NODE_TYPE, APP_TYPE } from '../enum';
import { addFlowNode, deleteFlowNode, updateFlowNodeName, updateNodeDesc } from '../../redux/actions';
import errorBoundary from 'ming-ui/decorators/errorBoundary';

@errorBoundary
class EditFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeId: '',
      nodeType: '',
      actionId: '',
      selectNodeId: '',
      selectNodeType: '',
      scale: 100,
      isCopy: false,
      selectCopyIds: [],
    };
  }

  componentDidMount() {
    this.changeScreenWidth();
    this.setViewCenter();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevProps, this.props) || prevState.scale !== this.state.scale) {
      this.changeScreenWidth();
      this.setViewCenter();
    }

    if (
      prevProps.workflowDetail.flowNodeMap &&
      !_.isEqual(prevProps.workflowDetail.flowNodeMap, this.props.workflowDetail.flowNodeMap) &&
      Object.keys(this.props.workflowDetail.flowNodeMap).length === 1
    ) {
      this.setState({ nodeId: this.props.workflowDetail.startEventId, nodeType: 0 });
    }

    if (prevState.nodeId !== this.state.nodeId || prevState.isCopy !== this.state.isCopy) {
      $('.workflowEdit').css('margin-right', this.state.nodeId && !this.state.isCopy ? 560 : 0);

      if (this.state.nodeId) {
        this.setNodeCenter(this.state.nodeId, true);
      }
    }
  }

  firstLoad = true;
  // 记录是否有变更
  change = false;

  changeScreenWidth() {
    let maxWidth = $('.workflowEdit').width();

    $('.workflowEdit .workflowEditContent > .flexColumn > .workflowBranch').map((i, item) => {
      if (maxWidth < ($(item).width() * this.state.scale) / 100) {
        maxWidth = ($(item).width() * this.state.scale) / 100;
      }
    });

    $('.workflowEdit .workflowEditContent').width(maxWidth);
  }

  setViewCenter() {
    const scrollWidth = ($('.workflowEdit')[0] || {}).scrollWidth;
    const width = $('.workflowEdit').width();

    if (scrollWidth > width && this.firstLoad) {
      $('.workflowEdit').scrollLeft((scrollWidth - width) / 2);
      this.firstLoad = false;
    }
  }

  /**
   * 设置节点居中显示
   */
  setNodeCenter(nodeId, onlyHorizontal) {
    const $el = $(`.workflowBox[data-id=${nodeId}]`);

    if (!$el.length) return;

    const { top, left } = $el.offset();
    const $box = $('.workflowSettings .workflowEdit');
    const scrollTop = $box.scrollTop();
    const scrollLeft = $box.scrollLeft();

    !onlyHorizontal && $box.scrollTop(scrollTop + top - $box.height() / 2 + $el.height() / 2 - 30);
    $box.scrollLeft(scrollLeft + left - $box.width() / 2 + $el.width() / 2);
  }

  /**
   * 选择添加节点的id
   */
  selectAddNodeId = (nodeId, nodeType, actionId) => {
    if (nodeId && this.change && this.state.selectNodeId) {
      this.detailUpdateConfirm(() => {
        this.closeDetail();
        this.setState({ nodeId, nodeType, actionId });
      });
    } else {
      this.closeDetail();
      this.setState({ nodeId, nodeType, actionId });
    }
  };

  /**
   * 复制节点
   */
  selectCopy = () => {
    this.setState({ isCopy: true });
  };

  /**
   * 取消复制
   */
  cancelCopy = () => {
    this.setState({
      nodeId: '',
      nodeType: '',
      actionId: '',
      isCopy: false,
      selectCopyIds: [],
    });
  };

  /**
   * 选择复制的节点
   */
  selectCopyNode = nodeId => {
    const selectCopyIds = [].concat(this.state.selectCopyIds);

    if (selectCopyIds.indexOf(nodeId) > -1) {
      _.remove(selectCopyIds, id => id === nodeId);
    } else {
      selectCopyIds.push(nodeId);
    }

    this.setState({ selectCopyIds });
  };

  /**
   * 创建复制节点
   */
  createCopyNode = () => {
    const { nodeId, selectCopyIds } = this.state;
    const copyNodeSize = selectCopyIds.length;

    if (!copyNodeSize) {
      alert(_l('请选择以下高亮节点进行复制'), 2);
      return;
    }

    this.props.dispatch(
      addFlowNode(
        this.props.workflowDetail.id,
        {
          prveId: nodeId,
          nodeIds: selectCopyIds,
          name: _l('-复制'),
        },
        () => {
          alert(_l('%0个节点复制成功', copyNodeSize));

          setTimeout(() => {
            this.setNodeCenter(nodeId);
          }, 1000);
        },
      ),
    );
    this.cancelCopy();
  };

  /**
   * 添加节点
   */
  addFlowNode = args => {
    this.props.dispatch(addFlowNode(this.props.workflowDetail.id, args));
  };

  /**
   * 删除节点
   */
  deleteNode = id => {
    // 删除当前打开详情的节点，关闭详情
    if (id === this.state.selectNodeId) {
      this.closeDetail();
    }
    this.props.dispatch(deleteFlowNode(this.props.workflowDetail.id, id));
  };

  /**
   * 修改节点名称
   */
  updateNodeName = (name, id) => {
    this.props.dispatch(updateFlowNodeName(this.props.workflowDetail.id, id, name));
  };

  /**
   * 更新节点别名和说明
   */
  updateNodeDesc = (id, alias, desc) => {
    this.props.dispatch(updateNodeDesc(id, alias, desc));
  };

  /**
   * render节点
   */
  renderNode = (data, firstId) => {
    const { flowInfo, workflowDetail } = this.props;
    const { startEventId, flowNodeMap, child } = workflowDetail;
    const firstNode = flowNodeMap[startEventId];
    const disabled =
      ((firstNode.appType === APP_TYPE.SHEET || firstNode.appType === APP_TYPE.DATE) && !firstNode.appName) ||
      (firstNode.appType === APP_TYPE.LOOP && !firstNode.executeTime) ||
      (firstNode.appType === APP_TYPE.WEBHOOK && !firstNode.count) ||
      (firstNode.appType === APP_TYPE.PBC && !firstNode.appId);

    return getSameLevelIds(data, firstId).map((id, i) => {
      const props = {
        key: id,
        processId: this.props.workflowDetail.id,
        item: data[id],
        disabled,
        nodeId: this.state.nodeId,
        selectNodeId: this.state.selectNodeId,
        isCopy: this.state.isCopy,
        selectCopyIds: this.state.selectCopyIds,
        child,
        relationId: flowInfo.relationId,
        selectAddNodeId: this.selectAddNodeId,
        selectCopy: this.selectCopy,
        selectCopyNode: this.selectCopyNode,
        addFlowNode: this.addFlowNode,
        deleteNode: this.deleteNode,
        openDetail: this.openDetail,
        updateNodeName: this.updateNodeName,
        updateNodeDesc: this.updateNodeDesc,
      };

      if (!data[id]) return null;

      const NodeComponent = nodeModules[data[id].typeId];
      // 分支
      if (data[id].typeId === NODE_TYPE.BRANCH) {
        return <NodeComponent {...props} dispatch={this.props.dispatch} data={data} renderNode={this.renderNode} />;
      }

      return <NodeComponent {...props} />;
    });
  };

  /**
   * 打开详情
   */
  openDetail = (id, type) => {
    const switchDetail = () => {
      this.setState({ selectNodeId: id, selectNodeType: type });
      this.change = false;
    };

    if (this.state.selectNodeId !== id) {
      if (this.change) {
        this.detailUpdateConfirm(switchDetail);
      } else {
        switchDetail();
      }
    }
  };

  /**
   * 详情有更新弹层
   */
  detailUpdateConfirm(onOk = () => {}) {
    Dialog.confirm({
      className: 'switchDetailConfirm',
      title: _l('要保存对节点的修改吗？'),
      description: _l('当前节点中有尚未保存的修改，你在继续操作前是否需要保存这些修改？'),
      okText: _l('否，放弃修改'),
      buttonType: 'ghost',
      cancelText: _l('是，前往保存'),
      cancelType: 'primary',
      onOk,
    });
  }

  /**
   * 关闭详情
   */
  closeDetail = () => {
    this.change = false;
    this.setState({ selectNodeId: '', selectNodeType: '' });
  };

  /**
   * 详情是否有更改
   */
  haveChange = change => {
    this.change = change;
  };

  render() {
    const { flowInfo, workflowDetail } = this.props;

    if (_.isEmpty(workflowDetail)) {
      return <LoadDiv className="mTop15" />;
    }

    const { startEventId, flowNodeMap } = workflowDetail;
    const { nodeId, nodeType, actionId, selectNodeId, selectNodeType, scale, isCopy, selectCopyIds } = this.state;
    const detailProps = {
      companyId: flowInfo.companyId,
      processId: flowInfo.id,
      relationId: flowInfo.relationId,
      relationType: flowInfo.relationType,
      selectNodeId,
      selectNodeType,
      selectNodeName: selectNodeId ? (flowNodeMap[selectNodeId] || {}).name : '',
      child: flowInfo.child,
      isCopy,
      closeDetail: this.closeDetail,
      haveChange: this.haveChange,
    };
    const startNodeError =
      (flowNodeMap[startEventId] || {}).appId &&
      !(flowNodeMap[startEventId] || {}).appName &&
      flowNodeMap[startEventId].appType !== APP_TYPE.PBC;

    return (
      <Fragment>
        <div className={cx('workflowEdit flex mTop20 flexRow', { addTop: startNodeError })}>
          <div
            className="workflowEditContent"
            style={{ transform: `scale(${scale / 100})`, transformOrigin: 'center top' }}
          >
            {this.renderNode(flowNodeMap, startEventId)}
            <End />
          </div>
        </div>

        <Detail {...detailProps} />
        <CreateNodeDialog
          companyId={flowInfo.companyId}
          flowNodeMap={flowNodeMap}
          isLast={nodeId ? (flowNodeMap[nodeId] || {}).nextId === '99' : false}
          nodeId={isCopy ? '' : nodeId}
          nodeType={nodeType}
          actionId={actionId}
          addFlowNode={this.addFlowNode}
          selectAddNodeId={this.selectAddNodeId}
          hasPushNode={_.includes([8], flowInfo.startAppType) && !flowInfo.child}
        />

        <div className={cx('workflowEditBtns', { addTop: startNodeError })}>
          <i
            className={cx('ThemeColor3 icon-add', { disabled: scale === 100 })}
            onClick={() => scale < 100 && this.setState({ scale: scale + 10 })}
          />
          <i
            className={cx('ThemeColor3 icon-maximizing_a2', { disabled: scale === 50 })}
            onClick={() => scale > 50 && this.setState({ scale: scale - 10 })}
          />
          <span className="Font14 mLeft10">{scale}%</span>
        </div>

        {startNodeError && (
          <div className="Font15 workflowWarning workflowError">
            <i className="icon-task-setting_promet mRight10" />
            {_l('触发流程的数据对象已删除。必须重新设置触发方式后，才能配置其他节点')}
          </div>
        )}

        <EditingBar
          visible={isCopy}
          title={
            selectCopyIds.length
              ? _l('已选择%0个复制节点', selectCopyIds.length)
              : _l('选择要复制的节点，依次复制到目标位置')
          }
          defaultTop={-72}
          visibleTop={65}
          updateText={_l('复制')}
          onUpdate={this.createCopyNode}
          onCancel={this.cancelCopy}
        />
      </Fragment>
    );
  }
}

export default connect(state => state.workflow)(EditFlow);
