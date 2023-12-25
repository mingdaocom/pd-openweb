import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import './index.less';
import nodeModules from './nodeModules';
import End from './End';
import { CreateNodeDialog, Thumbnail } from './components';
import Detail from '../Detail';
import cx from 'classnames';
import { Dialog, LoadDiv, EditingBar } from 'ming-ui';
import { getSameLevelIds } from '../utils';
import { APP_TYPE, NODE_TYPE } from '../enum';
import {
  addFlowNode,
  deleteFlowNode,
  updateFlowNodeName,
  updateNodeDesc,
  updateBranchGatewayType,
  updateBranchSort,
} from '../../redux/actions';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import _ from 'lodash';

@errorBoundary
class EditFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeId: '',
      selectNodeId: '',
      selectNodeType: '',
      scale: 100,
      isCopy: false,
      selectProcessId: '',
      selectCopyIds: [],
      hideNodes: JSON.parse(localStorage.getItem('workflowHideNodes') || '[]'),
      refreshPosition: '',
      refreshThumbnail: '',
      showThumbnail: false,
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
      this.setState({ nodeId: this.props.workflowDetail.startEventId });
    }

    if (
      prevProps.workflowDetail.flowNodeMap &&
      Object.keys(prevProps.workflowDetail.flowNodeMap).length !==
        Object.keys(this.props.workflowDetail.flowNodeMap).length
    ) {
      this.setState({ refreshThumbnail: +new Date(), refreshPosition: +new Date() });
    }
  }

  firstLoad = true;
  // 记录是否有变更
  change = false;

  changeScreenWidth() {
    const $box = $('.workflowEdit');
    const $content = $box.find('.workflowEditContent');
    let maxWidth = $box.width();

    $content.find('> .flexColumn > .workflowBranch, > .flexColumn > .approvalProcessBoxBox').map((i, item) => {
      if (maxWidth < ($(item).innerWidth() * this.state.scale) / 100) {
        maxWidth = ($(item).innerWidth() * this.state.scale) / 100;
      }
    });

    $content.width(maxWidth);
  }

  setViewCenter() {
    const box = document.getElementsByClassName('workflowEdit')[0] || {};
    const scrollWidth = box.scrollWidth;
    const width = box.clientWidth;

    if (scrollWidth > width && this.firstLoad) {
      $('.workflowEdit').scrollLeft((scrollWidth - width) / 2);
      this.firstLoad = false;
    }
  }

  /**
   * 选择添加节点的id
   */
  selectAddNodeId = (nodeId, selectProcessId) => {
    if (nodeId && this.change && this.state.selectNodeId) {
      this.detailUpdateConfirm(() => {
        this.closeDetail();
        this.setState({ nodeId, selectProcessId, isCopy: false });
      });
    } else {
      this.closeDetail();
      this.setState({ nodeId, selectProcessId, isCopy: false });
    }
  };

  /**
   * 复制节点
   */
  selectCopy = processId => {
    this.setState({ isCopy: true, selectProcessId: processId });
  };

  /**
   * 取消复制
   */
  cancelCopy = () => {
    this.setState({
      nodeId: '',
      isCopy: false,
      selectCopyIds: [],
      selectProcessId: '',
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
    const { nodeId, selectCopyIds, selectProcessId } = this.state;
    const copyNodeSize = selectCopyIds.length;

    if (!copyNodeSize) {
      alert(_l('请选择以下高亮节点进行复制'), 2);
      return;
    }

    this.props.dispatch(
      addFlowNode(
        selectProcessId,
        {
          prveId: nodeId,
          nodeIds: selectCopyIds,
        },
        () => {
          alert(_l('%0个节点复制成功', copyNodeSize));
        },
      ),
    );
    this.cancelCopy();
  };

  /**
   * 添加节点
   */
  addFlowNode = (processId, args) => {
    this.props.dispatch(
      addFlowNode(processId, args, id => {
        if (args.typeId === NODE_TYPE.APPROVAL_PROCESS) {
          this.openDetail(processId, id, args.typeId);
        }
      }),
    );
  };

  /**
   * 删除节点
   */
  deleteNode = (processId, id) => {
    // 删除当前打开详情的节点，关闭详情
    if (id === this.state.selectNodeId) {
      this.closeDetail();
    }
    this.props.dispatch(deleteFlowNode(processId, id));
  };

  /**
   * 修改节点名称
   */
  updateNodeName = (processId, id, name) => {
    this.props.dispatch(updateFlowNodeName(processId, id, name));
  };

  /**
   * 更新节点别名和说明
   */
  updateNodeDesc = (processId, id, alias, desc) => {
    this.props.dispatch(updateNodeDesc(processId, id, alias, desc));
  };

  /**
   * 修改分支节点类型
   */
  updateBranchGatewayType = (processId, nodeId, gatewayType) => {
    this.props.dispatch(updateBranchGatewayType(processId, nodeId, gatewayType));
  };

  /**
   * 调整分支顺序
   */
  updateBranchSort = (processId, nodeId, flowIds) => {
    this.props.dispatch(updateBranchSort(processId, nodeId, flowIds));
  };

  /**
   * render节点
   */
  renderNode = ({ processId, data, firstId, excludeFirstId = false, isApproval }) => {
    const { flowInfo, workflowDetail } = this.props;
    const { startEventId, flowNodeMap, child, isSimple } = workflowDetail;
    const firstNode = flowNodeMap[startEventId];
    const disabled =
      ((firstNode.appType === APP_TYPE.SHEET || firstNode.appType === APP_TYPE.DATE) && !firstNode.appName) ||
      (firstNode.appType === APP_TYPE.LOOP && !firstNode.executeTime) ||
      (firstNode.appType === APP_TYPE.WEBHOOK && !firstNode.count) ||
      (firstNode.appType === APP_TYPE.PBC && !firstNode.appId && !child) ||
      (this.state.isCopy && processId !== this.state.selectProcessId);

    return getSameLevelIds(data, firstId, excludeFirstId).map((id, i) => {
      const props = {
        key: id,
        companyId: flowInfo.companyId,
        processId,
        data,
        item: data[id],
        disabled,
        startEventId,
        nodeId: this.state.nodeId,
        selectNodeId: this.state.selectNodeId,
        isCopy: this.state.isCopy,
        selectCopyIds: this.state.selectCopyIds,
        selectProcessId: this.state.selectProcessId,
        child,
        relationId: flowInfo.relationId,
        isRelease: !!flowInfo.parentId,
        hideNodes: this.state.hideNodes,
        dispatch: this.props.dispatch,
        isApproval: isApproval || firstNode.appType === APP_TYPE.APPROVAL_START,
        isSimple,
        renderNode: this.renderNode,
        selectAddNodeId: this.selectAddNodeId,
        selectCopy: this.selectCopy,
        selectCopyNode: this.selectCopyNode,
        addFlowNode: this.addFlowNode,
        deleteNode: this.deleteNode,
        openDetail: this.openDetail,
        updateNodeName: this.updateNodeName,
        updateNodeDesc: this.updateNodeDesc,
        updateBranchGatewayType: this.updateBranchGatewayType,
        updateBranchSort: this.updateBranchSort,
        updateHideNodes: hideNodes => this.setState({ hideNodes }),
        updateRefreshThumbnail: () => this.setState({ refreshThumbnail: +new Date(), refreshPosition: +new Date() }),
      };

      if (!data[id]) return null;

      const NodeComponent = nodeModules[data[id].typeId];

      return <NodeComponent {...props} />;
    });
  };

  /**
   * 打开详情
   */
  openDetail = (processId, id, type) => {
    const { flowInfo, workflowDetail } = this.props;
    const { isCopy } = this.state;
    const switchDetail = () => {
      this.setState({ selectProcessId: processId, selectNodeId: id, selectNodeType: type });
      this.change = false;
    };

    if (isCopy) return;

    // 审批流开始节点未完成配置
    if (flowInfo.id !== processId) {
      let startConfigComplete = false;

      Object.keys(workflowDetail.flowNodeMap).forEach(key => {
        if (
          workflowDetail.flowNodeMap[key].typeId === NODE_TYPE.APPROVAL_PROCESS &&
          workflowDetail.flowNodeMap[key].processNode.id === processId &&
          workflowDetail.flowNodeMap[key].selectNodeId
        ) {
          startConfigComplete = true;
        }
      });

      if (!startConfigComplete) {
        alert(_l('请先配置发起审批的数据对象'), 2);
        return;
      }
    }

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
    this.setState({ selectNodeId: '', selectNodeType: '', selectProcessId: '' });
  };

  /**
   * 详情是否有更改
   */
  haveChange = change => {
    this.change = change;
  };

  /**
   * 触发滚动
   */
  triggerScroll = _.debounce(() => {
    if (this.state.showThumbnail) {
      this.setState({ refreshPosition: +new Date() });
    }
  }, 300);

  /**
   * 获取详情参数
   */
  getDetailOptions() {
    const { flowInfo, workflowDetail } = this.props;
    const { selectProcessId, selectNodeId, isCopy } = this.state;

    if (!selectProcessId || isCopy) return {};

    if (selectProcessId === workflowDetail.id) {
      return {
        companyId: flowInfo.companyId,
        processId: flowInfo.id,
        relationId: flowInfo.relationId,
        relationType: flowInfo.relationType,
        flowInfo,
        selectNodeName: (workflowDetail.flowNodeMap[selectNodeId] || {}).name,
        isApproval: flowInfo.startAppType === APP_TYPE.APPROVAL_START,
      };
    } else {
      let approvalProcessDetail = {};

      Object.keys(workflowDetail.flowNodeMap).forEach(key => {
        if (
          workflowDetail.flowNodeMap[key].processNode &&
          workflowDetail.flowNodeMap[key].processNode.id === selectProcessId
        ) {
          approvalProcessDetail = workflowDetail.flowNodeMap[key].processNode;
        }
      });

      return {
        companyId: approvalProcessDetail.companyId,
        processId: approvalProcessDetail.id,
        relationId: flowInfo.relationId,
        relationType: flowInfo.relationType,
        selectNodeName: (approvalProcessDetail.flowNodeMap[selectNodeId] || {}).name,
        isApproval: true,
      };
    }
  }

  /**
   * 完整显示
   */
  fullDisplay = () => {
    const $content = $('.workflowEdit')[0];

    if ($content.clientHeight < $content.scrollHeight) {
      let scale = Math.floor((($content.clientHeight / $content.scrollHeight) * this.state.scale) / 10) * 10;

      if (scale <= 50) scale = 50;
      if (scale >= 100) scale = 100;

      this.setState({ scale, refreshThumbnail: +new Date() });
    }
  };

  render() {
    const { flowInfo, workflowDetail } = this.props;
    const {
      nodeId,
      selectNodeId,
      selectNodeType,
      scale,
      isCopy,
      selectCopyIds,
      refreshPosition,
      refreshThumbnail,
      showThumbnail,
      selectProcessId,
    } = this.state;

    if (_.isEmpty(workflowDetail)) {
      return <LoadDiv className="mTop15" />;
    }

    const { startEventId, flowNodeMap } = workflowDetail;
    const detailProps = {
      selectNodeId,
      selectNodeType,
      isCopy,
      closeDetail: this.closeDetail,
      haveChange: this.haveChange,
      deleteNode: this.deleteNode,
      ...this.getDetailOptions(),
    };
    const startNodeError =
      (flowNodeMap[startEventId] || {}).appId &&
      !(flowNodeMap[startEventId] || {}).appName &&
      !_.includes([APP_TYPE.PBC, APP_TYPE.PARAMETER], flowNodeMap[startEventId].appType);

    return (
      <Fragment>
        <div
          className={cx(
            'workflowEdit flex flexRow',
            { addTop: startNodeError },
            { workflowEditRelease: flowInfo.parentId },
          )}
          onScroll={this.triggerScroll}
        >
          <div
            className="workflowEditContent"
            style={{ transform: `scale(${scale / 100})`, transformOrigin: 'center 48px' }}
          >
            {this.renderNode({ processId: flowInfo.id, data: flowNodeMap, firstId: startEventId })}
            <End />
          </div>
        </div>

        <Detail {...detailProps} isIntegration={location.href.indexOf('integration') > -1} />
        <CreateNodeDialog
          flowInfo={flowInfo}
          flowNodeMap={flowNodeMap}
          isLast={nodeId ? (flowNodeMap[nodeId] || {}).nextId === '99' : false}
          nodeId={isCopy ? '' : nodeId}
          selectProcessId={selectProcessId}
          isApproval={flowInfo.startAppType === APP_TYPE.APPROVAL_START}
          addFlowNode={this.addFlowNode}
          selectAddNodeId={this.selectAddNodeId}
          selectCopy={this.selectCopy}
        />

        <div className={cx('workflowEditBtn', { addTop: startNodeError })}>
          <span data-tip={_l('画布概览')}>
            <i
              className={cx('icon-map ThemeHoverColor3', { ThemeColor3: showThumbnail })}
              onClick={() => {
                if (Object.keys(flowNodeMap).length > 500) {
                  alert(_l('节点数量过多此功能不可用'), 2);
                  return false;
                }

                this.setState({ showThumbnail: !showThumbnail, refreshPosition: +new Date() });
              }}
            />
          </span>
          <span className="workflowEditBtnLine" />

          <span data-tip={_l('缩小')}>
            <i
              className={cx('icon-minus ThemeHoverColor3', { disabled: scale === 50 })}
              onClick={() => scale > 50 && this.setState({ scale: scale - 10, refreshThumbnail: +new Date() })}
            />
          </span>
          <span className="Font14 mRight8 TxtCenter" style={{ width: 40 }}>
            {scale}%
          </span>
          <span data-tip={_l('放大')}>
            <i
              className={cx('icon-add ThemeHoverColor3', { disabled: scale === 100 })}
              onClick={() => scale < 100 && this.setState({ scale: scale + 10, refreshThumbnail: +new Date() })}
            />
          </span>

          <span data-tip={_l('适应高度')}>
            <i className="icon-settings_overscan ThemeHoverColor3" onClick={this.fullDisplay} />
          </span>
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

        {Object.keys(flowNodeMap).length <= 500 && (
          <Thumbnail visible={showThumbnail} refreshPosition={refreshPosition} refreshThumbnail={refreshThumbnail} />
        )}
      </Fragment>
    );
  }
}

export default connect(state => state.workflow)(EditFlow);
