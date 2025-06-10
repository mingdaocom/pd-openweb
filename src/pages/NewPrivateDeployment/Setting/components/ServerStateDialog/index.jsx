import React, { Component, Fragment } from 'react';
import { Dialog, Icon, Input, Tooltip } from 'ming-ui';
import privateSysSetting from 'src/api/privateSysSetting';
import RegExpValidator from 'src/utils/expression';
import './index.less';

export default class ServerStateDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serviceStatusWebhookUrl: md.global.SysSettings.serviceStatusWebhookUrl,
    };
  }
  handleSave = () => {
    const { serviceStatusWebhookUrl } = this.state;

    if (serviceStatusWebhookUrl && !RegExpValidator.isUrlRequest(serviceStatusWebhookUrl)) {
      alert(_l('请输入正确的地址'), 2);
      return;
    }

    privateSysSetting
      .editSysSettings({
        settings: {
          ServiceStatusWebhookUrl: serviceStatusWebhookUrl,
        },
      })
      .then(result => {
        if (result) {
          this.props.onCancel();
          this.props.onChange(serviceStatusWebhookUrl);
          md.global.SysSettings.serviceStatusWebhookUrl = serviceStatusWebhookUrl;
          alert(_l('修改成功'), 1);
        }
      });
  };
  render() {
    const { serviceStatusWebhookUrl } = this.state;
    const { visible } = this.props;
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={_l('服务状态提醒')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <div className="mBottom10 mTop15 Font14">{_l('服务状态 Webhook')}</div>
        <div className="flexRow valignWrapper Relative">
          <Input
            className="w100"
            value={serviceStatusWebhookUrl}
            onChange={value => {
              this.setState({ serviceStatusWebhookUrl: value });
            }}
            placeholder={`http://`}
          />
          <Tooltip
            tooltipClass="serviceStatusWebhookUrlTooltip"
            text={
              <pre>
                {`
响应体示例：
{
  "serverName": "service000", // 实例名，单机版编号为0，集群版与 ENV_SERVERID 编号一致
  "services": [{
    "name": "mysql", // 服务名
    "status": 1 // 状态 0:异常 1:正常 2:未启用
  },
  {
    "name": "kafka",
    "status": 1
  },
  {
    "name": "redis",
    "status": 1
  },
  {
    "name": "basic",
    "status": 1
  }]
}
`}
              </pre>
            }
          >
            <Icon icon="error1" className="Font18 Gray_9e mLeft5 pointer" />
          </Tooltip>
        </div>
      </Dialog>
    );
  }
}
