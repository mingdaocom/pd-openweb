import React, { Component } from 'react';
import _ from 'lodash';
import { navigateTo } from 'router/navigation/navigateTo';
import { VerifyPasswordInput } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { captcha } from 'ming-ui/functions';
import account from 'src/api/account';
import { encrypt } from 'src/utils/services/security/encryption';
import './index.less';

export default class ValidPassWord extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      disabled: false,
    };
  }

  handleSubmit() {
    this.setState({ disabled: true });
    const { projectId, companyName } = this.props;

    var throttled = _.throttle(
      res => {
        if (res.ret === 0) {
          account
            .validateExitProject({
              password: encrypt(this.state.password),
              projectId,
              ticket: res.ticket,
              randStr: res.randstr,
              captchaType: md.global.getCaptchaType(),
            })
            .then(result => {
              if (result === 2) {
                alert(_l('密码错误'), 3);
                $('inputBox').val('').focus();
              } else if (result === 4) {
                // 需要 注销网络 [即 他是最后一个成员 也是 最后的 管理员]
                this.props.modal.confirm({
                  centered: true,
                  title: <span className="Font15">{_l('您是组织【%0】超级管理员', companyName)}</span>,
                  content: <span className="Font13 textPrimary">{_l('请先注销组织或交接后方可注销。')}</span>,
                  okText: _l('前往注销'),
                  cancelButtonProps: { style: { display: 'none' } },
                  onOk: () => {
                    this.props.closeDialog();
                    navigateTo('/admin/sysinfo/' + projectId);
                  },
                });
              } else {
                // result
                // 1 success
                // 2 password error
                // 3 need transfter admin
                this.props.closeDialog();
                this.props.transferAdminProject(projectId, companyName, this.state.password, result);
              }
            })
            .finally(() => {
              this.setState({ disabled: false });
            });
        }
      },
      10000,
      { leading: true },
    );

    new captcha(throttled);
  }

  render() {
    const { disabled } = this.state;
    const { closeDialog = () => {}, modalContextHolder, visible } = this.props;

    return (
      <Modal
        open={visible}
        title={_l('提示')}
        className="dialogBoxValidate"
        okText={_l('确认')}
        okDisabled={false}
        confirmLoading={disabled}
        onCancel={closeDialog}
        onOk={() => {
          if (!disabled) {
            this.handleSubmit();
          }
        }}
      >
        {modalContextHolder}
        <div className="TxtLeft">
          <VerifyPasswordInput autoFocus onChange={({ password }) => this.setState({ password })} />
        </div>
      </Modal>
    );
  }
}

function ValidPassWordWithModal(props) {
  const [modal, modalContextHolder] = Modal.useModal();

  return <ValidPassWord {...props} modal={modal} modalContextHolder={modalContextHolder} />;
}

ValidPassWord.confirm = props => functionWrap(ValidPassWordWithModal, { ...props, closeFnName: 'closeDialog' });
