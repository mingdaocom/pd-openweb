import React, { Component, Fragment } from 'react';
import { Menu, MenuItem } from 'ming-ui';
import _ from 'lodash';
import { NODE_TYPE } from '../../enum';
import BranchDialog from './BranchDialog';

export default class CreateNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: false,
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
      return <div className="workflowAddActionBox Gray_75 Font14">{_l('复制到此处')}</div>;
    }

    if (isAddState) {
      return isApproval || data[startEventId].nextId === '99' ? (
        <div className="workflowAddActionBox Gray_75 Font14" style={{ width: 261 }}>
          {_l('选择要执行的动作')}
        </div>
      ) : (
        <div className="workflowAddActionBox Gray_75 Font14">
          {_l('选择要执行的动作，或')}
          <span className="ThemeColor3 pointer workflowCopyBtn" onClick={() => selectCopy(processId)}>
            {_l('复制已有节点')}
          </span>
        </div>
      );
    }

    return (
      <Fragment>
        <i
          className="icon-custom_add_circle"
          onClick={() => {
            if (isApproval) {
              this.setState({ showOptions: true });
            } else {
              !isCopy && selectAddNodeId(item.id);
            }
          }}
        >
          {text && <span className="Font14 mLeft10">{text}</span>}
        </i>
      </Fragment>
    );
  }

  /**
   * 渲染更多操作
   */
  renderMoreOptions() {
    const { removeCopyBtn } = this.props;
    const { showOptions } = this.state;
    const LIST = [
      { type: 4, name: _l('审批'), iconColor: '#7E57C2', iconName: 'icon-workflow_ea' },
      { type: 3, name: _l('填写%03025'), iconColor: '#00BCD4', iconName: 'icon-workflow_write' },
      { type: 5, name: _l('抄送%03026'), iconColor: '#2196f3', iconName: 'icon-workflow_notice' },
      { type: 1, name: _l('分支'), iconColor: '#4C7D9E', iconName: 'icon-workflow_branch' },
      { type: 26, name: _l('数据处理'), iconColor: '#ffa340', iconName: 'icon-workflow' },
      { type: -1, name: _l('复制'), iconColor: '#BDBDBD', iconName: 'icon-copy' },
    ];

    if (!showOptions) return null;

    if (removeCopyBtn) {
      _.remove(LIST, o => o.type === -1);
    }

    return (
      <Menu className="mTop10" onClickAway={() => this.setState({ showOptions: false })}>
        {LIST.map((o, i) => (
          <Fragment key={i}>
            {o.type === -1 && <div className="mTop5 mBottom5" style={{ background: '#eaeaea', height: 1 }} />}
            <MenuItem className="flexRow" key={i} onClick={() => this.moreOptionsAction(o)}>
              <i className={`Font16 ${o.iconName}`} style={{ color: o.iconColor }} />
              <span className="Font14 mLeft10 Gray">{o.name}</span>
            </MenuItem>
          </Fragment>
        ))}
      </Menu>
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
        this.createBranchNode({ moveType: 0, isOrdinary: false });
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

    this.setState({ showOptions: false });
  }

  /**
   * 判断是否是条件分支
   */
  isConditionalBranch() {
    const { item } = this.props;
    const { typeId, actionId } = item;

    return (
      _.includes([NODE_TYPE.APPROVAL, NODE_TYPE.SEARCH, NODE_TYPE.FIND_SINGLE_MESSAGE], typeId) ||
      (typeId === NODE_TYPE.ACTION && actionId === '20')
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
        {this.renderMoreOptions()}

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
