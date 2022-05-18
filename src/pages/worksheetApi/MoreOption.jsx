import React, { Component } from 'react';
import appManagementAjax from 'src/api/appManagement';
import { Dialog } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Input } from 'antd';
import account from 'src/api/account';
import captcha from 'src/components/captcha';
import { encrypt } from 'src/util';
import SecretKey from './SecretKey';

@withClickAway
export default class MoreOption extends Component {
  constructor(props) {
    super(props);

    const { data = {} } = props;
    const { remark } = data;

    this.state = {
      showDescDialog: false,
      showConfirm: false,
      showEditDialog: false,
      remark,
      password: '',
      type: '',
    };
  }

  editAuthorizeStatus = () => {
    const { appId, data = {}, setFn, getAuthorizes } = this.props;
    const { type } = this.state;
    let ajax;

    if (type === 'cancel') {
      ajax = appManagementAjax.editAuthorizeStatus({
        appId,
        appKey: data.appKey,
        type: data.type,
        viewNull: data.viewNull,
        status: 2,
      });
    } else {
      ajax = appManagementAjax.deleteAuthorizeStatus({
        appId,
        appKey: data.appKey,
      });
    }

    ajax.then(res => {
      getAuthorizes();
      setFn(false);
    });
  };

  renderDesc = () => {
    const { setFn, data = {}, appId, getAuthorizes } = this.props;
    const { appKey } = data;
    const { showDescDialog, remark } = this.state;

    if (!showDescDialog) return null;

    return (
      <Dialog
        className="setDescDialog"
        visible={true}
        title={_l('备注')}
        autoScrollBody
        type="scroll"
        maxHeight={200}
        width={500}
        onOk={() => {
          if (remark.trim() === '') {
            alert(_l('请输入备注信息'), 3);
            return;
          }

          appManagementAjax
            .editAuthorizeRemark({
              appId,
              appKey,
              remark: remark.trim(),
            })
            .then(res => {
              getAuthorizes();
              this.setState({ showDescDialog: false });
              setFn(false);
            });
        }}
        onCancel={() => {
          this.setState({ showDescDialog: false });
          setFn(false);
        }}
      >
        <input
          type="text"
          placeholder={_l('备注')}
          onChange={e => this.setState({ remark: e.target.value })}
          value={remark}
        />
      </Dialog>
    );
  };

  renderCancelAndDeleteDialog() {
    const { setFn } = this.props;
    const { showConfirm, type, password } = this.state;

    if (!showConfirm) return null;

    return (
      <Dialog
        visible={true}
        overlayClosable={false}
        title={
          type === 'cancel' ? <div>{_l('关闭授权')}</div> : <div style={{ color: '#f44336' }}>{_l('删除授权密钥')}</div>
        }
        width={500}
        onOk={() => {
          if (!password.toString().trim()) {
            alert(_l('请输入密码'), 2);
            return;
          }

          this.checkPassword(() => this.editAuthorizeStatus());
        }}
        onCancel={() => {
          this.setState({ showConfirm: false });
          setFn(false);
        }}
      >
        <div className="Gray_75">
          {type === 'cancel'
            ? _l('应用授权密钥是极为重要的凭证，关闭时需要验证身份')
            : _l('应用授权密钥是极为重要的凭证，删除时需要验证身份')}
        </div>
        <div className="mTop20">{_l('当前用户密码')}</div>
        <Input.Password
          className="boderRadAll_3 mTop10"
          placeholder={_l('请输入密码确认授权')}
          onChange={e => this.setState({ password: e.target.value })}
        />
      </Dialog>
    );
  }

  /**
   * 验证密码
   */
  checkPassword = callback => {
    const { password } = this.state;
    const checkPasswordFun = res => {
      if (res.ret !== 0) {
        return;
      }

      account
        .checkAccount({
          password: encrypt(password),
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.staticglobal.getCaptchaType(),
        })
        .then(data => {
          if (data === 1) {
            callback();
          } else if (data === 6) {
            alert(_l('密码错误'), 2);
          } else if (data === 8) {
            alert(_l('验证码错误'), 2);
          } else {
            alert(_l('操作失败'), 2);
          }
        });
    };

    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(checkPasswordFun);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), checkPasswordFun).show();
    }
  };

  render() {
    const { data, appId, getAuthorizes, setFn } = this.props;
    const { showEditDialog } = this.state;

    return (
      <React.Fragment>
        <ul className="moreOptionTrigger">
          <li onClick={() => this.setState({ showEditDialog: true })}>{_l('编辑')}</li>
          {data.status !== 2 && (
            <li onClick={() => this.setState({ showConfirm: true, type: 'cancel' })}>{_l('关闭授权')}</li>
          )}
          <li onClick={() => this.setState({ showDescDialog: true })}>{_l('修改备注')}</li>
          <li onClick={() => this.setState({ showConfirm: true, type: 'delete' })} style={{ color: '#f44336' }}>
            {_l('删除')}
          </li>
        </ul>

        {showEditDialog && (
          <SecretKey
            appId={appId}
            appKey={data.appKey}
            status={data.status}
            type={data.type}
            viewNull={data.viewNull}
            getAuthorizes={getAuthorizes}
            onClose={() => setFn(false)}
          />
        )}
        {this.renderDesc()}
        {this.renderCancelAndDeleteDialog()}
      </React.Fragment>
    );
  }
}
