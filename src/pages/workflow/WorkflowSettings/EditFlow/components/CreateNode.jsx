import React, { Component } from 'react';
import _ from 'lodash';
import { Dropdown } from 'ming-ui/antd-components';
import { NODE_TYPE } from '../../enum';
import BranchDialog from './BranchDialog';

export default class CreateNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchDialogModel: 0,
    };
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const {
      processId,
      item,
      disabled,
      nodeId,
      selectAddNodeId,
      isCopy,
      selectCopy,
      text,
      isApproval,
      data,
      startEventId,
    } = this.props;
    const isAddState = nodeId === item.id;

    if (disabled) {
      return null;
    }

    if (isAddState && isCopy) {
      return <div className="workflowAddActionBox textSecondary Font14">{_l('复制到此处')}</div>;
    }

    if (isAddState) {
      return isApproval || data[startEventId].nextId === '99' ? (
        <div className="workflowAddActionBox textSecondary Font14" style={{ width: 261 }}>
          {_l('选择要执行的动作')}
        </div>
      ) : (
        <div className="workflowAddActionBox textSecondary Font14">
          {_l('选择要执行的动作，或')}
          <span className="colorPrimary pointer workflowCopyBtn" onClick={() => selectCopy(processId)}>
            {_l('复制已有节点')}
          </span>
        </div>
      );
    }

    const trigger = (
      <i className="icon-custom_add_circle" onClick={() => !isApproval && !isCopy && selectAddNodeId(item.id)}>
        {text && <span className="Font14 mLeft10">{text}</span>}
      </i>
    );

    return isApproval ? this.renderMoreOptions(trigger) : trigger;
  }

  /**
   * 渲染更多操作
   */
  renderMoreOptions(trigger) {
    const { removeCopyBtn } = this.props;
    const LIST = [
      { type: 4, name: _l('审批'), iconColor: '#A00416', iconName: 'icon-workflow_ea' },
      { type: 3, name: _l('填写%03025'), iconColor: '#00BCD4', iconName: 'icon-workflow_write' },
      { type: 5, name: _l('抄送%03026'), iconColor: '#1677ff', iconName: 'icon-send' },
      { type: 1, name: _l('分支'), iconColor: '#4C7D9E', iconName: 'icon-workflow_branch' },
      { type: 26, name: _l('更多动作'), iconColor: '#ffa340', iconName: 'icon-workflow' },
      { type: -1, name: _l('复制'), iconColor: '#BDBDBD', iconName: 'icon-copy' },
    ];
    const list = removeCopyBtn ? LIST.filter(item => item.type !== -1) : LIST;
    const items = list.flatMap(item => [
      ...(item.type === -1 ? [{ key: 'divider', type: 'divider' }] : []),
      {
        key: item.type,
        icon: <i className={`Font16 ${item.iconName}`} style={{ color: item.iconColor }} />,
        label: <span className="Font14 textPrimary">{item.name}</span>,
        onClick: () => this.moreOptionsAction(item),
      },
    ]);

    return (
      <Dropdown trigger={['click']} placement="bottom" menu={{ items }}>
        {trigger}
      </Dropdown>
    );
  }

  /**
   * 更多操作点击
   */
  moreOptionsAction(o) {
    const { processId, addFlowNode, item, selectAddNodeId, selectCopy, removeCopyBtn } = this.props;

    if (_.includes([NODE_TYPE.WRITE, NODE_TYPE.APPROVAL, NODE_TYPE.CC], o.type)) {
      addFlowNode(processId, {
        name: o.name,
        prveId: item.id,
        typeId: o.type,
      });
    } else if (o.type === NODE_TYPE.BRANCH) {
      if (this.isConditionalBranch()) {
        this.setState({ branchDialogModel: 2 });
      } else if (!item.nextId || item.nextId === '99' || removeCopyBtn) {
        this.createBranchNode({ moveType: 0, isOrdinary: true });
      } else {
        this.setState({ branchDialogModel: 1 });
      }
    } else if (o.type === NODE_TYPE.APPROVAL_PROCESS) {
      // 数据处理
      selectAddNodeId(item.id, processId);
    } else {
      selectAddNodeId(item.id);
      selectCopy(processId);
    }
  }

  /**
   * 判断是否是条件分支
   */
  isConditionalBranch() {
    const { item } = this.props;
    const { typeId, actionId, execute } = item;

    return (
      _.includes([NODE_TYPE.APPROVAL, NODE_TYPE.SEARCH, NODE_TYPE.FIND_SINGLE_MESSAGE], typeId) ||
      (typeId === NODE_TYPE.ACTION && actionId === '20') ||
      execute
    );
  }

  /**
   * 分支弹层确认
   */
  createBranchNode = ({ moveType, isOrdinary }) => {
    const { processId, addFlowNode, item } = this.props;

    addFlowNode(processId, {
      name: _l('分支'),
      prveId: item.id,
      typeId: NODE_TYPE.BRANCH,
      moveType,
      gatewayType: 2,
      resultFlow: !isOrdinary,
    });

    this.setState({ showBranchDialog: false });
  };

  render() {
    const { data, item, className = '' } = this.props;
    const { branchDialogModel } = this.state;

    return (
      <div className={`workflowLineBtn ${className}`}>
        {this.renderContent()}

        {!!branchDialogModel && (
          <BranchDialog
            {...this.props}
            nodeId={item.id}
            flowNodeMap={data}
            isLast={item.nextId === '99'}
            isConditionalBranch={branchDialogModel === 2}
            onSave={({ isOrdinary, moveType }) => this.createBranchNode({ isOrdinary, moveType })}
            onClose={() => this.setState({ branchDialogModel: 0 })}
          />
        )}
      </div>
    );
  }
}
