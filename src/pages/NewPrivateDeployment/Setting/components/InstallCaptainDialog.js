import React, { Component, Fragment } from 'react';
import { Dialog, Input } from 'ming-ui';
import privateSysSetting from 'src/api/privateSysSetting';
import RegExpValidator from 'src/utils/expression';

export default class InstallCaptainDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      installCaptainUrl:
        md.global.SysSettings.installCaptainUrl || location.protocol + '//' + location.hostname + ':38881/settings',
    };
  }
  handleSave = () => {
    const { installCaptainUrl } = this.state;

    if (RegExpValidator.isUrlRequest(installCaptainUrl)) {
      privateSysSetting
        .editSysSettings({
          settings: {
            InstallCaptainUrl: installCaptainUrl,
          },
        })
        .then(result => {
          if (result) {
            this.props.onCancel();
            this.props.onSave(installCaptainUrl);
            md.global.SysSettings.installCaptainUrl = installCaptainUrl;
            alert(_l('修改成功'), 1);
          }
        });
    } else {
      alert(_l('请输入正确的url'), 2);
    }
  };
  render() {
    const { visible } = this.props;
    const { installCaptainUrl } = this.state;
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={_l('管理器访问地址')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <Input
          className="w100 mTop15"
          value={installCaptainUrl}
          onChange={value => {
            this.setState({ installCaptainUrl: value });
          }}
        />
      </Dialog>
    );
  }
}
