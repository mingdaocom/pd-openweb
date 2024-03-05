import React, { Component, Fragment } from 'react';
import { Dialog, Input } from 'ming-ui';
import privateSysSetting from 'src/api/privateSysSetting';
import RegExp from 'src/util/expression';

export default class WorkWXIntegrationDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workWxSelfBuildNoticUrl: md.global.SysSettings.workWxSelfBuildNoticUrl,
    };
  }
  handleSave = () => {
    const { workWxSelfBuildNoticUrl } = this.state;
    if (workWxSelfBuildNoticUrl && !RegExp.isUrlRequest(workWxSelfBuildNoticUrl)) {
      alert(_l('请输入正确的地址'), 2);
      return;
    }

    if (RegExp.isUrlRequest(workWxSelfBuildNoticUrl)) {
      privateSysSetting
        .editSysSettings({
          settings: {
            WorkWxSelfBuildNoticUrl: workWxSelfBuildNoticUrl,
          },
        })
        .then(result => {
          if (result) {
            this.props.onCancel();
            this.props.onSave(workWxSelfBuildNoticUrl);
            md.global.SysSettings.workWxSelfBuildNoticUrl = workWxSelfBuildNoticUrl;
            alert(_l('修改成功'), 1);
          }
        });
    } else {
      alert(_l('请输入正确的url'), 2);
    }
  };
  render() {
    const { visible } = this.props;
    const { workWxSelfBuildNoticUrl } = this.state;
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={_l('申请上架企业微信通知地址')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <Input
          className="w100 mTop15"
          value={workWxSelfBuildNoticUrl}
          onChange={value => {
            this.setState({ workWxSelfBuildNoticUrl: value });
          }}
        />
      </Dialog>
    );
  }
}
