import React, { Component } from 'react';
import ClipboardButton from 'react-clipboard.js';
import Trigger from 'rc-trigger';
import privateRequest from 'src/api/private';
import mobile from 'src/pages/appInstallSetting/images/mobile.png';
import pc from 'src/pages/appInstallSetting/images/pc.png';
import code from './images/code.png';
import './index.less';

export default class AppInstallSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      qrCodeUrl: '',
      downloadAppQrCodeUrl: '',
    };
  }
  componentDidMount() {
    privateRequest.getAPIUrl().then(({ url, qrCodeUrl, downloadAppQrCodeUrl }) => {
      this.setState({
        url,
        qrCodeUrl,
        downloadAppQrCodeUrl,
      });
    });
  }
  renderTitle() {
    return <div className="appInstallSettingTitle Font16 bold">{_l('App下载与设置')}</div>;
  }
  renderHeader() {
    const { url, qrCodeUrl } = this.state;
    return (
      <div className="appInstallSettingHeader">
        <div className="Font24 mBottom18">{_l('App 初次启动需要填写的配置信息')}</div>
        <div className="flexRow Font14">
          <span>{url}</span>
          <ClipboardButton
            className="copy"
            component="span"
            data-clipboard-text={url}
            onSuccess={() => {
              alert(_l('复制成功'));
            }}
          >
            {_l('复制')}
          </ClipboardButton>
          <Trigger
            action={['click']}
            popup={
              <div className="card z-depth-2 pAll15">
                <img style={{ width: 300 }} src={qrCodeUrl} />
              </div>
            }
            popupAlign={{
              offset: [0, 7],
              points: ['tc', 'bc'],
              overflow: { adjustX: 1, adjustY: 2 },
            }}
          >
            <span className="scanCode">{_l('扫描二维码填写')}</span>
          </Trigger>
        </div>
      </div>
    );
  }
  renderContent() {
    const { downloadAppQrCodeUrl } = this.state;
    return (
      <div className="appInstallSettingContent">
        <div className="Font16 bold title">{_l('下载客户端')}</div>
        <div className="TxtCenter mTop40 Font32">{_l('工作信息时刻保持连接')}</div>
        <div className="TxtCenter mTop30 Font16">
          {_l('不管是在电脑前，还是出门在外，都能让你与工作信息时刻保持连接')}
        </div>
        <div className="flexRow TxtCenter justifyContentCenter mTop50">
          <div className="flexColumn pcWrapper">
            <img src={pc} />
            <span className="Font17 name">{_l('PC桌面端')}</span>
          </div>
          <div className="flexColumn mobileWrapper">
            <img src={mobile} />
            <span className="Font17 name">{_l('移动端')}</span>
          </div>
        </div>
        <div className="flexRow TxtCenter justifyContentCenter mTop50">
          <div className="flexColumn justifyContentCenter downloadWrapper">
            <div className="downloadBtn flexColumn Gray_75">
              <span className="Font17">{_l('Mac 下载')}</span>
              <span className="Font13">{_l('敬请期待')}</span>
            </div>
            <div className="downloadBtn flexColumn Gray_75">
              <span className="Font17">{_l('Windows 下载')}</span>
              <span className="Font13">{_l('敬请期待')}</span>
            </div>
          </div>
          <div className="flexColumn appewmWrapper">
            <img src={downloadAppQrCodeUrl ? downloadAppQrCodeUrl : code} />
            <span className="name">{_l('扫码下载')}</span>
          </div>
        </div>
      </div>
    );
  }
  render() {
    return (
      <div className="appInstallSettingWrapper card mAll15 pAll15">
        {this.renderTitle()}
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  }
}
