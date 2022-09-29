import React, { Fragment, Component } from 'react';
import ReactDom from 'react-dom';
import { Dialog, Radio } from 'ming-ui';
import userController from 'src/api/user';
import transferController from 'src/api/transfer';
import './style.less';

const CHECK_RESULTS = {
  FAILED: 0,
  SUCCESS: 1,
  NEEDTRANSFER: 2,
  NOAUTHORITY: 3,
};
class InvoiceSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'handToBot',
      info: {},
      visible: false,
      isTransfer: false,
    };
  }

  componentDidMount() {
    this.init();
  }

  init() {
    const { accountId, projectId, success, user } = this.props;
    Dialog.confirm({
      title: '',
      description: _l('是否确认将该员工【%0】移除？', user.fullname),
      buttonType: 'danger',
      onOk: () => {
        userController
          .removeUser({
            accountId,
            projectId,
          })
          .then(result => {
            if (result === CHECK_RESULTS.NEEDTRANSFER) {
              this.setState({ visible: true });
            } else if (result === CHECK_RESULTS.SUCCESS) {
              success();
            } else if (result === CHECK_RESULTS.NOAUTHORITY) {
              this.fail(_l('暂无权限'));
            } else {
              this.fail();
            }
          });
      },
    });
  }

  fail(msg) {
    alert(msg || _l('操作失败, 请确认是否有足够权限移除用户'), 2);
  }

  handleTransferType(value) {
    this.setState({
      type: value,
      info: {},
    });
  }

  addUserToTransfer() {
    const { projectId, accountId } = this.props;
    import('dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        SelectUserSettings: {
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          projectId,
          filterAccountIds: [accountId],
          unique: true,
          callback: users => {
            this.setState({ info: users[0] });
          },
        },
      });
    });
  }

  closeDialog() {
    this.setState({ visible: false });
  }

  handleTransfer() {
    if (this.state.isTransfer) {
      return;
    }
    this.setState({ isTransfer: true });
    const { projectId, accountId, success } = this.props;
    const { info = {} } = this.state;
    transferController
      .transferAll({
        projectId,
        oldAccountId: accountId,
        toAccountId: info.accountId || '',
      })
      .then(result => {
        if (result) {
          alert(_l('完成交接成功'));
          success(null);
          this.closeDialog();
        } else {
          this.setState({ isTransfer: false });
          alert(_l('完成交接失败'), 2);
        }
      });
  }

  render() {
    const { type, info = {}, visible, isTransfer } = this.state;
    const { user = {} } = this.props;
    const isToBot = type === 'handToBot';
    return (
      <Dialog
        visible={visible}
        width={480}
        title={<div className="Font17 Bold">{_l('办理离职')}</div>}
        okDisabled={!isToBot && !info.accountId}
        onCancel={() => this.closeDialog()}
        onOk={() => this.handleTransfer()}
        okText={isTransfer ? _l('交接中...') : _l('确认')}
      >
        <div className="transferTask">
          <div className="LineHeight24">
            <a href={'/user_' + user.accountId} className="ThemeColor3 Bold" title={user.fullname}>
              {user.fullname}
            </a>
            <span>{_l('仍是某协作模块负责人，可移交给企业小秘书')}</span>
          </div>
          <div className="LineHeight24">{_l('或 指定另一名同事负责交接')}</div>
          <div className="LineHeight24">
            <span className="Bold">{_l('注意：')}</span>
            <span>{_l('工作流暂不支持一键交接，需手动让该员工将其负责的工作流托付给他人')}</span>
          </div>
          <div className="Bold mTop28">{_l('交接人')}</div>
          <Radio text={_l('企业小秘书')} checked={isToBot} onClick={() => this.handleTransferType('handToBot')} />
          <Radio text={_l('指定同事')} checked={!isToBot} onClick={() => this.handleTransferType('handToOther')} />
          {!isToBot ? (
            <Fragment>
              <div className="Bold mTop28">{_l('选择交接的同事')}</div>
              <div className="transferSelectUserBox">
                {info.accountId ? (
                  <div className="transferUserInfo">
                    <img src={info.avatar} />
                    <span className="overflow_ellipsis">{info.fullname}</span>
                  </div>
                ) : null}
                {info.accountId ? (
                  <span className="Hand Hover_49 transferOption" onClick={() => this.addUserToTransfer()}>
                    <span className="icon-swap_horiz"></span>
                  </span>
                ) : (
                  <span
                    className="icon-task_add-02 Hand Gray_9 Font26 Hover_49"
                    onClick={() => this.addUserToTransfer()}
                  ></span>
                )}
              </div>
            </Fragment>
          ) : null}
        </div>
      </Dialog>
    );
  }
}

export default function (props) {
  ReactDom.render(<InvoiceSetting {...props} />, document.createElement('div'));
}
