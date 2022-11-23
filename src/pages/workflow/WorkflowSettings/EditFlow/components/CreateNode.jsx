import React, { Component, Fragment } from 'react';
import { Menu, MenuItem, Dialog, Radio } from 'ming-ui';
import _ from 'lodash';
import { NODE_TYPE } from '../../enum';
import cx from 'classnames';

export default class CreateNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: false,
      showBranchDialog: false,
      moveType: 1,
    };
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { processId, item, disabled, nodeId, selectAddNodeId, isCopy, selectCopy, text, isApproval } = this.props;
    const isAddState = nodeId === item.id;

    if (disabled) {
      return null;
    }

    if (isAddState && isCopy) {
      return <div className="workflowAddActionBox Gray_75 Font14">{_l('复制到此处')}</div>;
    }

    if (isAddState) {
      return (
        <div className="workflowAddActionBox Gray_75 Font14">
          {_l('选择要执行的动作，或')}
          <span className="ThemeColor3 pointer workflowCopyBtn" onClick={() => selectCopy(processId)}>
            {_l('复制')}
          </span>
          {_l('已有节点')}
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
              !isCopy && selectAddNodeId(item.id, item.typeId, item.actionId);
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
    const { processId, addFlowNode, item, selectAddNodeId, selectCopy, removeCopyBtn } = this.props;
    const { showOptions } = this.state;
    const LIST = [
      { type: 4, name: _l('审批'), iconColor: '#7E57C2', iconName: 'icon-workflow_ea' },
      { type: 3, name: _l('填写'), iconColor: '#00BCD4', iconName: 'icon-workflow_write' },
      { type: 5, name: _l('抄送'), iconColor: '#2196f3', iconName: 'icon-workflow_notice' },
      { type: 1, name: _l('数据分支'), iconColor: '#4C7D9E', iconName: 'icon-workflow_branch' },
      {
        type: 1,
        name: _l('结果分支(开发中)'),
        iconColor: '#9e9e9e',
        iconName: 'icon-user_Review',
        disabled: true,
      },
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
            <MenuItem
              className="flexRow"
              key={i}
              onClick={() => {
                if (o.disabled) return;

                if (_.includes([NODE_TYPE.WRITE, NODE_TYPE.APPROVAL, NODE_TYPE.CC], o.type)) {
                  addFlowNode(processId, {
                    name: o.name,
                    prveId: item.id,
                    typeId: o.type,
                  });
                } else if (o.type === NODE_TYPE.BRANCH) {
                  if (!item.nextId || item.nextId === '99' || removeCopyBtn) {
                    this.createBranchNode({ noMove: true });
                  } else {
                    this.setState({ showBranchDialog: true });
                  }
                } else {
                  selectAddNodeId(item.id);
                  selectCopy(processId);
                }

                this.setState({ showOptions: false });
              }}
            >
              <i className={`Font16 ${o.iconName}`} style={{ color: o.iconColor }} />
              <span className={cx('Font14 mLeft10', { Gray_bd: o.disabled })}>{o.name}</span>
            </MenuItem>
          </Fragment>
        ))}
      </Menu>
    );
  }

  /**
   * 渲染分支
   */
  renderBranch() {
    const { moveType } = this.state;
    const MOVE_TYPE = [{ text: _l('左侧'), value: 1 }, { text: _l('不移动'), value: 0 }];

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
  createBranchNode = ({ noMove }) => {
    const { processId, addFlowNode, item } = this.props;
    const { moveType } = this.state;

    addFlowNode(processId, {
      name: _l('分支'),
      prveId: item.id,
      typeId: NODE_TYPE.BRANCH,
      moveType: noMove ? 0 : moveType,
      gatewayType: 2,
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
