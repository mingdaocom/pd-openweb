import React, { Component, Fragment } from 'react';
import { string, func, oneOf, shape, array } from 'prop-types';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import { Dialog, Textarea, Dropdown } from 'ming-ui';
import { ACTION_TO_TEXT } from './config';
import Signature from 'src/components/newCustomFields/widgets/Signature';

export default class Approve extends Component {
  static propTypes = {
    action: oneOf(['after', 'before', 'pass', 'transfer', 'transferApprove']),
    flowNodeName: string,
    userName: string,
    selectedUser: shape({
      avatar: string,
      accountId: string,
      fullname: string,
    }),
    selectedUsers: array,
    onOk: func.isRequired,
    onCancel: func.isRequired,
  };
  static defaultProps = {
    action: 'before',
    flowNodeName: '',
    userName: '',
    selectedUser: {
      avatar: '',
      accountId: '',
      fullname: '',
    },
    selectedUsers: [],
    onOk: () => {},
    onCancel: () => {},
  };
  state = {
    content: '',
    backNodeId: '',
    signature: '',
  };
  /**
   * 根据操作类型渲染头部
   */
  renderHeader = () => {
    const { action, selectedUser, selectedUsers } = this.props;
    const { avatar, accountId, fullname } = selectedUser;

    if (_.includes(['pass', 'overrule'], action)) {
      const { name } = this.props.data.flowNode;
      return (
        <header className="flexRow">
          <div className="headerText Font17">
            {ACTION_TO_TEXT[action].headerText}
            <span className="flowNode">{name}</span>
          </div>
        </header>
      );
    }

    if (_.includes(['after', 'before'], action)) {
      return (
        <header className="flexRow">
          <UserHead size={32} className="userAvatar" user={{ userHead: avatar, accountId }} />
          <div className="name Font17">{fullname}</div>
          <div className="headerText Font17">{ACTION_TO_TEXT[action].headerText}</div>
        </header>
      );
    }

    if (_.includes(['transfer', 'transferApprove'], action)) {
      return (
        <header className="flexRow">
          <div className="headerText Font17">{ACTION_TO_TEXT[action].headerText}</div>
          <UserHead size={32} className="userAvatar" user={{ userHead: avatar, accountId }} />
          <div className="name Font17">{fullname}</div>
        </header>
      );
    }

    if (_.includes(['addApprove'], action)) {
      return (
        <header className="flexRow">
          <div className="headerText Font17">
            {ACTION_TO_TEXT[action].headerText.replace(/\d+/, selectedUsers.length)}
          </div>
        </header>
      );
    }
  };

  handleChange = content => {
    this.setState({
      content,
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    const { action } = this.props;
    const { content, backNodeId } = this.state;
    return nextProps.action !== action || nextState.content !== content || nextState.backNodeId !== backNodeId;
  }

  onOk = () => {
    const { action, onOk, selectedUser, selectedUsers } = this.props;
    const { signatureType } = (this.props.data || {}).flowNode || {};
    const id = selectedUsers.length ? selectedUsers.map(item => item.accountId).join(',') : selectedUser.accountId;
    const { content, backNodeId, signature } = this.state;

    if (signatureType === 1 && action === 'pass' && !signature) {
      alert(_l('签名不能为空', 2));
      return;
    }
    onOk({ action, content, userId: id, backNodeId, signature: signature ? JSON.parse(signature) : undefined });
  };

  render() {
    const { action, onCancel } = this.props;
    const { isCallBack, signatureType } = (this.props.data || {}).flowNode || {};
    const { content, backNodeId, signature } = this.state;
    const backFlowNodes = [{ text: _l('不退回'), value: '' }].concat(
      ((this.props.data || {}).backFlowNodes || []).map(item => {
        return {
          text: item.name,
          value: item.id,
        };
      }),
    );

    return (
      <Dialog
        className={`approveDialog ${action === 'overrule' ? 'approveDialogBtn' : ''}`}
        visible
        width={560}
        title={this.renderHeader()}
        onOk={this.onOk}
        onCancel={onCancel}
        okText={ACTION_TO_TEXT[action].okText}
      >
        <div className="Gray_75">{_l('审批意见')}</div>
        <Textarea
          className="mTop10"
          height={120}
          value={content}
          onChange={this.handleChange}
          placeholder={ACTION_TO_TEXT[action].placeholder}
        />

        {isCallBack && action === 'overrule' && (
          <Fragment>
            <div className="Gray_75 mTop20">{_l('退回并重新进行审批')}</div>
            <Dropdown
              className="mTop10 approveDialogCallBack"
              data={backFlowNodes}
              value={backNodeId}
              border
              onChange={backNodeId => this.setState({ backNodeId })}
            />
          </Fragment>
        )}

        {signatureType === 1 && action === 'pass' && (
          <Fragment>
            <div className="Gray_75 mTop20 mBottom10 relative">
              <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
                *
              </div>
              {_l('签名')}
            </div>
            <Signature value={signature} onChange={signature => this.setState({ signature })} />
          </Fragment>
        )}
      </Dialog>
    );
  }
}
