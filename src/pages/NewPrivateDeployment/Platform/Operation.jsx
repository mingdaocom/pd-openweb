import React, { Fragment, useState, useEffect } from 'react';
import { ConfigProvider, Input, Button } from 'antd';
import { updateSysSettings } from '../common';
import privateSysSettingApi from 'src/api/privateSysSetting';

const EventSubscription = props => {
  const { SysSettings } = md.global;
  const [csmWebhookUrl, setCsmWebhookUrl] = useState(SysSettings.csmWebhookUrl);
  const handleSave = event => {
    const { value } = event.target;
    if (value !== md.global.SysSettings.csmWebhookUrl) {
      setCsmWebhookUrl(value);
      updateSysSettings({
        csmWebhookUrl: value
      }, () => {
        md.global.SysSettings.csmWebhookUrl = value;
      });
    }
  }
  const handleSendCsmWebhookTest = () => {
    privateSysSettingApi.sendCsmWebhookTest().then(data => {
      if (data) {
        alert(_l('发送成功'));
      }
    });
  }
  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('事件订阅')}</div>
      <div className="Gray_9e mBottom25">
        {_l('当组织、用户信息变更时，以标准的 HTTP 协议把事件内容推送到指定的地址。请求时间超过10秒则超时，超时后不再重试。')}
        <a
          className="pointer"
          target="_blank"
          href=""
        >
          {_l('文档链接')}
        </a>
      </div>
      <div className="flexRow valignWrapper mBottom20">
        <div className="mRight20">{_l('Webhook 地址')}</div>
        <Input
          className="flex"
          value={csmWebhookUrl}
          onChange={event => {
            setCsmWebhookUrl(event.target.value);
          }}
          onKeyDown={event => {
            if (event.which === 13) {
              handleSave(event);
            }
          }}
          onBlur={handleSave}
        />
      </div>
      <ConfigProvider autoInsertSpaceInButton={false}>
        <Button
          style={{ width: 120 }}
          type="primary"
          onClick={handleSendCsmWebhookTest}
        >
          {_l('发送测试示例')}
        </Button>
      </ConfigProvider>
    </div>
  );
}

const InfoGather = props => {
  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('组织信息收集')}</div>
      <div className="Gray_9e">{_l('用户创建组织时填写的行业、人数等字段可以通过webhook推送获取。填写字段也可以通过配置文件自定义，如需自定义请与对接人联系解决。')}</div>
    </div>
  );
}

const WorkWXIntegrationUrl = props => {
  const { SysSettings } = md.global;
  const [workWxSelfBuildNoticUrl, setWorkWxSelfBuildNoticUrl] = useState(SysSettings.workWxSelfBuildNoticUrl);
  const handleSave = (event) => {
    const { value } = event.target;
    if (value && !RegExp.isUrlRequest(value)) {
      alert(_l('请输入正确的地址'), 2);
      return;
    }
    if (value !== md.global.SysSettings.workWxSelfBuildNoticUrl) {
      updateSysSettings({
        WorkWxSelfBuildNoticUrl: value
      }, () => {
        md.global.SysSettings.workWxSelfBuildNoticUrl = value;
      });
    }
  }
  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('申请上架企业微信通知')}</div>
      <div className="Gray_9e mBottom25">
        {_l('平台用户申请将应用上架到企业微信工作台，通过接口将平台用户申请通知到平台管理员')}
      </div>
      <div className="flexRow valignWrapper mBottom20">
        <div className="mRight20">{_l('通知地址')}</div>
        <Input
          className="flex"
          value={workWxSelfBuildNoticUrl}
          onChange={event => {
            setWorkWxSelfBuildNoticUrl(event.target.value);
          }}
          onKeyDown={event => {
            if (event.which === 13) {
              handleSave(event);
            }
          }}
          onBlur={handleSave}
        />
      </div>
    </div>
  );
}

export default props => {
  return (
    <Fragment>
      <EventSubscription {...props} />
      {(md.global.Config.IsPlatformLocal || !md.global.SysSettings.hideWorkWeixin) && (
        <WorkWXIntegrationUrl {...props} />
      )}
      {/*<InfoGather {...props} />*/}
    </Fragment>
  );
}
