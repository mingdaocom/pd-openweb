import React, { Component, Fragment } from 'react';
import { Menu, MenuItem, Dialog, Radio } from 'ming-ui';
import _ from 'lodash';
import { NODE_TYPE } from '../../enum';

export default class CreateNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: false,
      showBranchDialog: false,
      moveType: 1,
      isOrdinary: true,
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
    const { item, removeCopyBtn } = this.props;
    const { showOptions } = this.state;
    const LIST = [
      { type: 4, name: _l('审批'), iconColor: '#7E57C2', iconName: 'icon-workflow_ea' },
      { type: 3, name: _l('填写%03025'), iconColor: '#00BCD4', iconName: 'icon-workflow_write' },
      { type: 5, name: _l('抄送%03026'), iconColor: '#2196f3', iconName: 'icon-workflow_notice' },
      { type: 1, name: _l('条件分支'), iconColor: '#4C7D9E', iconName: 'icon-workflow_branch' },
      {
        type: 0,
        name: _l('审批结果分支'),
        iconColor: '#4C7D9E',
        iconName: 'icon-user_Review',
      },
      { type: 26, name: _l('数据处理'), iconColor: '#ffa340', iconName: 'icon-workflow' },
      { type: -1, name: _l('复制'), iconColor: '#BDBDBD', iconName: 'icon-copy' },
    ];

    if (!showOptions) return null;

    if (removeCopyBtn) {
      _.remove(LIST, o => o.type === -1);
    }

    if (item.typeId !== NODE_TYPE.APPROVAL) {
      _.remove(LIST, o => o.type === 0);
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
      // 数据分支
      if (!item.nextId || item.nextId === '99' || removeCopyBtn) {
        this.createBranchNode({ noMove: true, isResultBranch: false });
      } else {
        this.setState({ showBranchDialog: true, isOrdinary: true });
      }
    } else if (o.type === 0) {
      // 审批结果分支
      if (!item.nextId || item.nextId === '99') {
        this.createBranchNode({ noMove: true, isResultBranch: true });
      } else {
        this.setState({ showBranchDialog: true, isOrdinary: false });
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
   * 渲染分支
   */
  renderBranch() {
    const { moveType, isOrdinary } = this.state;
    const MOVE_TYPE = isOrdinary
      ? [
          { text: _l('左侧'), value: 1 },
          { text: _l('不移动'), value: 0 },
        ]
      : [
          { text: _l('左侧（通过分支）'), value: 1 },
          { text: _l('右侧（否决分支）'), value: 2 },
          { text: _l('不移动'), value: 0 },
        ];

    return (
      <Dialog
        visible
        width={560}
        title={_l('分支下方的节点整体放置在')}
        onCancel={() => this.setState({ showBranchDialog: false, moveType: 1 })}
        onOk={this.createBranchNode}
      >
        {MOVE_TYPE.map(o => (
          <div key={o.value} className="mBottom15">
            <Radio
              className="Font15"
              text={o.text}
              checked={moveType === o.value}
              onClick={() => this.setState({ moveType: o.value })}
            />
          </div>
        ))}
        <div className="Gray_75 Font13 pLeft30" style={{ marginTop: -10 }}>
          {_l('等待分支汇集后再执行下方节点')}
        </div>
      </Dialog>
    );
  }

  /**
   * dialog确定
   */
  createBranchNode = ({ noMove, isResultBranch }) => {
    const { processId, addFlowNode, item } = this.props;
    const { moveType, isOrdinary } = this.state;

    addFlowNode(processId, {
      name: _l('分支'),
      prveId: item.id,
      typeId: NODE_TYPE.BRANCH,
      moveType: noMove ? 0 : moveType,
      gatewayType: 2,
      resultFlow: noMove ? isResultBranch : !isOrdinary,
    });

    this.setState({ showBranchDialog: false });
  };

  render() {
    const { className = '' } = this.props;
    const { showBranchDialog } = this.state;

    return (
      <div className={`workflowLineBtn ${className}`}>
        {this.renderContent()}
        {this.renderMoreOptions()}
        {showBranchDialog && this.renderBranch()}
      </div>
    );
  }
}
