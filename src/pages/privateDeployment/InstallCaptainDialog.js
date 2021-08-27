import React, { Component, Fragment } from 'react';
import { Dialog, Input } from 'ming-ui';
import privateSysSetting from 'src/api/privateSysSetting';
import { isUrlRequest } from 'src/util';

export default class InstallCaptainDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      installCaptainUrl: md.global.SysSettings.installCaptainUrl || location.protocol + '//' + location.hostname + ':38881/settings'
    }
  }
  handleSave = () => {
    const { installCaptainUrl } = this.state;

    if (isUrlRequest(installCaptainUrl)) {
      privateSysSetting.editSysSettings({
        settings: {
          InstallCaptainUrl: installCaptainUrl
        }
      }).then(result => {
        if (result) {
          this.props.onCancel();
          md.global.SysSettings.installCaptainUrl = installCaptainUrl;
          alert(_l('修改成功'), 1);
        }
      });
    } else {
      alert(_l('请输入正确的url'), 2);
    }
  }
  render() {
    const { installCaptainUrl } = this.state;
    return (
      <Dialog
        visible={true}
        anim={false}
        title={_l('安装管理器访问地址设置')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <div className="mBottom10 mTop15 Font14">{_l('自定义访问地址')}</div>
        <Input className="w100" value={installCaptainUrl} onChange={value => { this.setState({ installCaptainUrl: value }) }}/>
      </Dialog>
    );
  }
}
