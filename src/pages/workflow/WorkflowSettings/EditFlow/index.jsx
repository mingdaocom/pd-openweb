import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, EditingBar, LoadDiv, SvgIcon } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import {
  addFlowNode,
  deleteFlowNode,
  updateBranchGatewayType,
  updateBranchSort,
  updateFlowNodeName,
  updateNodeDesc,
} from '../../redux/actions';
import Detail from '../Detail';
import { ACTION_ID, APP_TYPE, NODE_TYPE } from '../enum';
import { getSameLevelIds } from '../utils';
import { CreateNodeDialog, NodeWrap, Thumbnail, WhiteNode } from './components';
import End from './End';
import nodeModules from './nodeModules';
import './index.less';

@errorBoundary
class EditFlow extends Component {
  constructor(props) {
    super(props);

    const { type, operatorId, operator, flowId } = props.urlParams;
    const isFlowView = type === '1' && operator !== 'execHistory';

    this.state = {
      nodeId: '',
      selectNodeId: isFlowView && operatorId ? operatorId : '',
      selectNodeType: isFlowView && operator ? _.parseInt(operator) : '',
      scale: 100,
      isCopy: false,
      selectProcessId: isFlowView && flowId ? flowId : '',
      selectCopyIds: [],
      hideNodes: JSON.parse(localStorage.getItem('workflowHideNodes') || '[]'),
      refreshPosition: '',
      refreshThumbnail: '',
      showThumbnail: false,
    };
  }

  componentDidMount() {
    const { selectNodeId } = this.state;

    this.changeScreenWidth();
    this.setViewCenter();

    if (selectNodeId) {
      setTimeout(() => {
        this.setElementVisibleInView(selectNodeId, true);
      }, 1000);
    }
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

    if (!prevProps.infoVisible && this.props.infoVisible) {
      this.cancelCopy();
      this.closeDetail();
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

    $content.width(maxWidth + 1600);
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

  setElementVisibleInView(nodeId, scrollIntoView = false) {
    if (!nodeId) return;

    const $el = $(`.workflowBox[data-id=${nodeId}]`)[0];

    if (!$el) return;

    const { x } = $el.getBoundingClientRect();
    const leftVisibleWidth = window.innerWidth - 1150;
    const $content = $('.workflowEdit');

    if (x < 0) {
      $content.scrollLeft($content[0].scrollLeft + x);
    } else if (x > leftVisibleWidth) {
      $content.scrollLeft($content[0].scrollLeft - (leftVisibleWidth - x));
    }

    scrollIntoView && $el.scrollIntoView({ block: 'center' });
  }

  /**
   * 选择添加节点的id
   */
  selectAddNodeId = (nodeId, selectProcessId) => {
    this.props.changeFlowInfo(false);

    // if (
    //   nodeId &&
    //   !selectProcessId &&
    //   Object.keys(flowNodeMap).filter(o => !_.includes([1, 2, 100], flowNodeMap[o].typeId)).length >= 201
    // ) {
    //   ExceedDialog();
    //   return;
    // }

    if (nodeId && this.change && this.state.selectNodeId) {
      this.detailUpdateConfirm(() => {
        this.closeDetail();
        this.setState({ nodeId, selectProcessId, isCopy: false });
      });
    } else {
      this.closeDetail();
      this.setState({ nodeId, selectProcessId, isCopy: false });
    }

    // this.setElementVisibleInView(nodeId);
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

    // if (
    //   nodeId &&
    //   selectProcessId === workflowDetail.id &&
    //   Object.keys(flowNodeMap).filter(o => !_.includes([1, 2, 100], flowNodeMap[o].typeId)).length + copyNodeSize > 201
    // ) {
    //   ExceedDialog();
    //   return;
    // }

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
      addFlowNode(processId, args, ({ id, subProcessId }) => {
        if (args.typeId === NODE_TYPE.APPROVAL_PROCESS) {
          this.openDetail(processId, id, args.typeId);
        }

        // 循环节点打开新页面
        if (
          args.typeId === NODE_TYPE.LOOP &&
          _.includes([ACTION_ID.CONDITION_LOOP, ACTION_ID.COUNT_LOOP], args.actionId)
        ) {
          window.open(`/workflowedit/${subProcessId}`);
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
    const { flowInfo, workflowDetail, isPlugin } = this.props;
    const { startEventId, flowNodeMap, child, isSimple } = workflowDetail;
    const firstNode = flowNodeMap[startEventId];
    const disabled =
      ((firstNode.appType === APP_TYPE.SHEET || firstNode.appType === APP_TYPE.DATE) && !firstNode.appName) ||
      (firstNode.appType === APP_TYPE.LOOP && !firstNode.executeTime) ||
      (firstNode.appType === APP_TYPE.WEBHOOK && !firstNode.count) ||
      (firstNode.appType === APP_TYPE.PBC && !firstNode.appId && !child && !isPlugin) ||
      (this.state.isCopy && processId !== this.state.selectProcessId);
    let pluginInputNode;
    let pluginOutputNode;
    let pluginInputNodeProps;
    const nodeList = getSameLevelIds(data, firstId, excludeFirstId).map(id => {
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
        relationType: flowInfo.relationType,
        isRelease: !!flowInfo.parentId,
        hideNodes: this.state.hideNodes,
        dispatch: this.props.dispatch,
        isApproval: isApproval || firstNode.appType === APP_TYPE.APPROVAL_START,
        isNestedProcess: isApproval,
        isSimple,
        isPlugin,
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

      // 工作流插件输入节点
      if (isPlugin && data[id].typeId === NODE_TYPE.FIRST) {
        pluginInputNode = <NodeComponent {...props} />;
        pluginInputNodeProps = props;

        return null;
      }

      // 工作流插件输出节点
      if (isPlugin && data[id].typeId === NODE_TYPE.PBC) {
        pluginOutputNode = <NodeComponent {...props} />;

        return null;
      }

      return <NodeComponent {...props} />;
    });

    // 插件
    if (isPlugin && workflowDetail.startEventId === firstId) {
      return (
        <Fragment>
          {pluginInputNode}
          <NodeWrap {...pluginInputNodeProps}>{nodeList}</NodeWrap>
          {pluginOutputNode}
        </Fragment>
      );
    }

    return nodeList;
  };

  /**
   * 打开详情
   */
  openDetail = (processId, id, type) => {
    const { flowInfo, workflowDetail, changeFlowInfo } = this.props;
    const { isCopy } = this.state;
    const switchDetail = () => {
      this.setState({ nodeId: '', selectProcessId: processId, selectNodeId: id, selectNodeType: type });
      this.change = false;
    };

    if (isCopy) return;

    changeFlowInfo(false);

    // 审批流开始节点未完成配置
    if (flowInfo.id !== processId && !flowInfo.parentId) {
      let startConfigComplete = false;

      Object.keys(workflowDetail.flowNodeMap).forEach(key => {
        if (
          workflowDetail.flowNodeMap[key].typeId === NODE_TYPE.APPROVAL_PROCESS &&
          ((workflowDetail.flowNodeMap[key].processNode.id === processId &&
            workflowDetail.flowNodeMap[key].selectNodeId) ||
            workflowDetail.flowNodeMap[key].id === id)
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

    // this.setElementVisibleInView(id);
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

  /**
   * 渲染插件节点
   */
  renderPluginNode = () => {
    const { flowInfo, infoVisible, changeFlowInfo } = this.props;

    return (
      <WhiteNode
        className="mBottom10"
        IconElement={
          flowInfo.iconName ? (
            <span className="workflowAvatar workflowAvatarSvg" style={{ background: flowInfo.iconColor }}>
              <SvgIcon url={flowInfo.iconName} fill="#fff" size={22} />
            </span>
          ) : (
            <i className="workflowAvatar icon-workflow" style={{ background: flowInfo.iconColor || '#1677ff' }} />
          )
        }
        nodeName={flowInfo.name}
        nodeDesc={_l('设置名称和图标')}
        isComplete={flowInfo.iconName}
        isActive={infoVisible}
        onClick={() => changeFlowInfo(true)}
      />
    );
  };

  render() {
    const { flowInfo, workflowDetail, urlParams, isPlugin } = this.props;
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
      instanceId: urlParams.operator === 'execHistory' && urlParams.operatorId ? urlParams.operatorId : '',
      debugEvents: flowInfo.debugEvents,
      isIntegration: location.href.indexOf('integration') > -1,
      isPlugin,
      closeDetail: this.closeDetail,
      haveChange: this.haveChange,
      deleteNode: this.deleteNode,
      ...this.getDetailOptions(),
    };
    const startNodeError =
      (flowNodeMap[startEventId] || {}).appId &&
      !(flowNodeMap[startEventId] || {}).appName &&
      !_.includes([APP_TYPE.PBC, APP_TYPE.PARAMETER, APP_TYPE.LOOP_PROCESS], flowNodeMap[startEventId].appType) &&
      !isPlugin;

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
            style={{
              paddingLeft: 1000,
              paddingRight: 1000,
              transform: `scale(${scale / 100})`,
              transformOrigin: 'center 48px',
            }}
          >
            {isPlugin && this.renderPluginNode()}
            {this.renderNode({ processId: flowInfo.id, data: flowNodeMap, firstId: startEventId })}
            {isPlugin ? <div className="workflowEndBox"></div> : <End />}
          </div>
        </div>

        <Detail {...detailProps} />

        {!flowInfo.parentId && (
          <CreateNodeDialog
            flowInfo={flowInfo}
            flowNodeMap={flowNodeMap}
            isLast={nodeId ? (flowNodeMap[nodeId] || {}).nextId === '99' : false}
            nodeId={isCopy ? '' : nodeId}
            selectProcessId={selectProcessId}
            isApproval={flowInfo.startAppType === APP_TYPE.APPROVAL_START}
            isPlugin={isPlugin}
            addFlowNode={this.addFlowNode}
            selectAddNodeId={this.selectAddNodeId}
            selectCopy={this.selectCopy}
          />
        )}

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
            <i className="icon-error1 mRight10 Gray_9e" />
            {_l('触发流程的数据对象已删除。必须重新设置触发方式后，才能配置其他节点')}
          </div>
        )}

        <EditingBar
          visible={isCopy}
          isBlack
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
