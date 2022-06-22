import React, { Component, Fragment } from 'react';
import { string, func, oneOf, shape, array } from 'prop-types';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import { Dialog, Textarea, Dropdown, Signature } from 'ming-ui';
import { ACTION_TO_TEXT } from './config';
import codeAuth from 'src/api/codeAuth';
import cx from 'classnames';

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

  constructor(props) {
    super(props);

    const { isCallBack } = (props.data || {}).flowNode || {};
    let backNodeId = '';

    if (props.action === 'overrule' && isCallBack) {
      backNodeId = _.get(props.data, 'backFlowNodes[0].id') || '';
    }

    this.state = {
      content: '',
      backNodeId,
      showCode: false,
      link: '',
      code: '',
      resultCode: '',
    };
  }

  isComplete = true;

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
    const { content, backNodeId, showCode, link, resultCode } = this.state;
    return (
      nextProps.action !== action ||
      nextState.content !== content ||
      nextState.backNodeId !== backNodeId ||
      nextState.showCode !== showCode ||
      nextState.link !== link ||
      nextState.resultCode !== resultCode
    );
  }

  onOk = (backNodeId = '') => {
    const { action, workId, onOk, onCancel, selectedUser, selectedUsers } = this.props;
    const { auth } = (this.props.data || {}).flowNode || {};
    const id = selectedUsers.length ? selectedUsers.map(item => item.accountId).join(',') : selectedUser.accountId;
    const { content } = this.state;

    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleContent = action === 'overrule' && _.includes(auth.overruleTypeList, 100);
    const overruleSignature = action === 'overrule' && _.includes(auth.overruleTypeList, 1);

    if (!this.isComplete) return;

    if (
      ((passContent || overruleContent) && !content.trim()) ||
      ((passSignature || overruleSignature) && this.signature.checkContentIsEmpty())
    ) {
      alert(_l('请填写完整内容', 2));
      return;
    }

    // 实名认证
    if (
      (action === 'pass' && _.includes(auth.passTypeList, 2)) ||
      (action === 'overrule' && _.includes(auth.overruleTypeList, 2))
    ) {
      codeAuth.getDefaultPicUrl({ workId }).then(res => {
        if (res.code === '-1') {
          this.getCode(2);
          this.setState({ showCode: true });
        } else {
          onOk({ action, content, userId: id, backNodeId, signature: { key: res.picUrl } });
        }
      });
    } else if (
      // 实名 + 实人认证
      (action === 'pass' && _.includes(auth.passTypeList, 3)) ||
      (action === 'overrule' && _.includes(auth.overruleTypeList, 3))
    ) {
      this.getCode();
      this.setState({ showCode: true });
    } else {
      this.isComplete = false;

      if (this.signature) {
        this.signature.saveSignature(signature => {
          onOk({ action, content, userId: id, backNodeId, signature });
        onCancel();
        });
      } else {
        onOk({ action, content, userId: id, backNodeId, signature: undefined });
      onCancel();
      }
    }
  };

  getCode(fixedSignMode) {
    const { action, workId } = this.props;
    const { auth } = (this.props.data || {}).flowNode || {};
    let signMode;

    if (action === 'pass') {
      signMode = _.includes(auth.passTypeList, 2) ? 1 : 2;
    }

    if (action === 'overrule') {
      signMode = _.includes(auth.overruleTypeList, 2) ? 1 : 2;
    }

    codeAuth.getQrCode({ signMode: fixedSignMode || signMode, workId }).then(res => {
      this.setState({ link: res.qrCode, code: res.state }, () => {
        this.getCodeResult();
      });
    });
  }

  getCodeResult() {
    const { action, onOk, selectedUser, selectedUsers } = this.props;
    const { content, backNodeId, code } = this.state;
    const id = selectedUsers.length ? selectedUsers.map(item => item.accountId).join(',') : selectedUser.accountId;

    codeAuth.getQrCodeResult({ state: code }).then(res => {
      if (res.code === '0') {
        this.getCodeResult();
      } else if (res.code === '1') {
        onOk({ action, content, userId: id, backNodeId, signature: { key: res.picUrl } });
      } else {
        this.setState({ resultCode: res.code });
      }
    });
  }

  render() {
    const { action, onCancel } = this.props;
    const { isCallBack, auth } = (this.props.data || {}).flowNode || {};
    const { content, backNodeId, showCode, link, resultCode } = this.state;
    const backFlowNodes = ((this.props.data || {}).backFlowNodes || []).map(item => {
      return {
        text: item.name,
        value: item.id,
      };
    });
    const isOverruleBack = action === 'overrule' && isCallBack && !!backFlowNodes.length;
    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleContent = action === 'overrule' && _.includes(auth.overruleTypeList, 100);
    const overruleSignature = action === 'overrule' && _.includes(auth.overruleTypeList, 1);

    if (showCode) {
      return (
        <Dialog
          visible
          width={560}
          title={_l('扫码刷脸')}
          footer={null}
          handleClose={() => this.setState({ showCode: false })}
        >
          <div className="Gray_9e">{_l('请用微信、微警或警融App扫下方二维码进行刷脸验证，验证通过后才能提交流程')}</div>
          <div className="mTop20 TxtCenter " style={{ minHeight: 200 }}>
            {link && (
              <div className="relative InlineBlock">
                <img src={link} />
                {resultCode && (
                  <div
                    className="flexColumn White"
                    onClick={() => {
                      this.setState({ resultCode: '' });
                      this.getCode(resultCode === '-3' ? 2 : '');
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(51, 51, 51, 0.80)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      className="flexRow mBottom15 pointer"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 30,
                        background: '#d85959',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className="icon-priority_high Font16" />
                    </div>

                    {resultCode === '-3' && (
                      <Fragment>
                        <div>{_l('认证失败')}</div>
                        <div>{_l('人脸信息不匹配')}</div>
                      </Fragment>
                    )}

                    {resultCode === '-2' && (
                      <Fragment>
                        <div>{_l('认证失败')}</div>
                        <div>{_l('点击刷新重试')}</div>
                      </Fragment>
                    )}

                    {resultCode === '-1' && (
                      <Fragment>
                        <div>{_l('二维码已过期')}</div>
                        <div>{_l('点击刷新重试')}</div>
                      </Fragment>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog>
      );
    }

    return (
      <Dialog
        className={cx(
          'approveDialog',
          { approveDialogBtn: action === 'overrule' && !isOverruleBack },
          { overruleBackBtn: isOverruleBack },
        )}
        visible
        overlayClosable={false}
        width={560}
        title={this.renderHeader()}
        handleClose={onCancel}
        onOk={() => this.onOk(backNodeId)}
        onCancel={isOverruleBack ? () => this.onOk() : onCancel}
        cancelText={isOverruleBack ? _l('直接否决') : _l('取消')}
        okText={isOverruleBack ? _l('否决并退回') : (ACTION_TO_TEXT[action] || {}).okText}
      >
        <div className="Gray_75 relative">
          {(passContent || overruleContent) && (
            <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
              *
            </div>
          )}
          {_l('审批意见')}
        </div>
        <Textarea
          className="mTop10"
          height={120}
          value={content}
          onChange={this.handleChange}
          placeholder={(ACTION_TO_TEXT[action] || {}).placeholder}
        />

        {isCallBack && action === 'overrule' && !!backFlowNodes.length && (
          <Fragment>
            <div className="Gray_75 mTop20">{_l('退回到')}</div>
            <Dropdown
              className="mTop10 approveDialogCallBack"
              data={backFlowNodes}
              value={backNodeId}
              border
              onChange={backNodeId => this.setState({ backNodeId })}
            />
          </Fragment>
        )}

        {(passSignature || overruleSignature) && (
          <Fragment>
            <div className="Gray_75 mTop20 mBottom10 relative">
              <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
                *
              </div>
              {_l('签名')}
            </div>
            <Signature
              ref={signature => {
                this.signature = signature;
              }}
            />
          </Fragment>
        )}
      </Dialog>
    );
  }
}
