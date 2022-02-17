import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Switch, LoadDiv } from 'ming-ui';
import { Modal, Input, Divider, Tooltip, Popover } from 'antd';
import styled from 'styled-components';
import ClipboardButton from 'react-clipboard.js';
import appManagement from 'src/api/appManagement';
import { saveAs } from 'file-saver';
import { getAppFeaturesPath } from 'src/util';

export const BtnWrap = styled.div`
  border-radius: 3px;
  height: 36px;
  line-height: 36px;
  padding: 0 10px;
  border: 1px solid #DDDDDD;
  &.active {
    color: #2196F3;
    border-color: #2196F3;
  }
  &.copy {
    padding: 0 20px;
    font-weight: 500;
  }
  &.copy, &.qrCode, &.code {
    &:hover {
      color: #2196F3;
      border-color: #2196F3;
      .icon {
        color: #2196F3 !important;
      }
    }
  }
`;

export const UrlWrap = styled.div`
  border-radius: 3px;
  height: 36px;
  line-height: 36px;
  background-color: #f1f1f1;
  color: #333;
  font-size: 14px;
  padding: 0 10px;
  overflow: hidden;
  input {
    border: none;
    background: inherit;
    font-size: inherit;
    width: 100%;
    margin-left: -1px;
  }
`;

export default class ShareDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null,
      embedVisible: false
    }
  }
  initConfig(props) {
    const { sourceId } = props;
    appManagement.getEntityShare({
      sourceId,
      sourceType: 21
    }).then(data => {
      this.setState({ data, loading: false });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.initConfig(nextProps);
    }
  }
  handleStatus = () => {
    const { sourceId } = this.props;
    const { status } = this.state.data;
    appManagement.editEntityShareStatus({
      sourceId,
      sourceType: 21,
      status: status ? 0 : 1
    }).then(result => {
      const { flag, appEntityShare } = result;
      this.setState({ data: appEntityShare });
    });
  }
  renderPopover(qrurl) {
    return (
      <Fragment>
        <img style={{ width: 164, height: 164 }} src={qrurl} />
        <div className="Font13 TxtCenter mTop5">{_l('扫描二维码')}</div>
        <div className="Font13 TxtCenter">{_l('发送分享链接')}</div>
        <div className="TxtCenter">
          <a className="Font13" onClick={() => { saveAs(qrurl, 'qrcode.jpg') }}>
            {_l('下载')}
          </a>
        </div>
      </Fragment>
    );
  }
  renderEmbeddedLink() {
    const { sourceId, appId } = this.props;
    const url = `${location.origin}/embed/page/${appId}/${sourceId}`;
    const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}`;
    return (
      <Fragment>
        <div className="Font15 bold mBottom15">{_l('嵌入链接')}</div>
        <div className="Font13 Gray_9e mBottom15">{_l('仅限应用成员登录系统后根据权限访问')}</div>
        <div className="flexRow mBottom20 valignWrapper">
          <UrlWrap className="flex valignWrapper mRight10">
            <input
              type="text"
              value={url}
              readOnly="readonly"
            />
            <Tooltip title={_l('新窗口打开')}>
              <Icon
                icon="launch"
                className="Font20 Gray_9e pointer hoverHighlight"
                onClick={() => {
                  window.open(`${url}?${getAppFeaturesPath}`);
                }}
              />
            </Tooltip>
          </UrlWrap>
          <ClipboardButton
            component="div"
            data-clipboard-text={url}
            onSuccess={() => {
              alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方'));
            }}
          >
            <BtnWrap className="mRight10 pointer valignWrapper copy">{_l('复制')}</BtnWrap>
          </ClipboardButton>
          {/*
          <Popover content={this.renderPopover(qrurl)}>
            <BtnWrap className="pointer mRight10 valignWrapper qrCode">
              <Icon className="Font22 Gray_75" icon="qr_code" />
            </BtnWrap>
          </Popover>
          */}
        </div>
      </Fragment>
    )
  }
  renderEmbedPublicLink() {
    const { data = {} } = this.state;
    const url = `${data.url}#embed`;
    return (
      <Fragment>
        <div className="mTop16 mBottom15 valignWrapper">
          <Icon className="Font18 mRight5" icon="code" />
          <div className="Font14 bold">{_l('嵌入链接')}</div>
        </div>
        <div className="flexRow mTop16 valignWrapper">
          <UrlWrap className="flex valignWrapper mRight10">
            <input
              type="text"
              value={url}
              readOnly="readonly"
            />
            <Tooltip title={_l('新窗口打开')}>
              <Icon
                icon="launch"
                className="Font20 Gray_9e pointer hoverHighlight"
                onClick={() => {
                  window.open(`${url}?${getAppFeaturesPath}`);
                }}
              />
            </Tooltip>
          </UrlWrap>
          <ClipboardButton
            component="div"
            data-clipboard-text={url}
            onSuccess={() => {
              alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方'));
            }}
          >
            <BtnWrap className="pointer valignWrapper copy">{_l('复制')}</BtnWrap>
          </ClipboardButton>
        </div>
      </Fragment>
    );
  }
  renderPublicLink() {
    const { isCharge } = this.props;
    const { data = {}, embedVisible } = this.state;
    const { url, status } = data;
    const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}&download=true`;
    return (
      <Fragment>
        <div className="Font15 bold mBottom15">{_l('公开分享')}</div>
        <div className="Font13 Gray_9e mBottom15">{_l('获得链接的所有人都可以查看')}</div>
        <div className="flexRow mBottom15">
          <Switch
            checked={!!status}
            disabled={!isCharge}
            onClick={this.handleStatus}
          />
          <div className="mLeft8">{status ? _l('开启') : _l('关闭')}</div>
        </div>
        {!!status && (
          <Fragment>
            <div className="flexRow mTop16 valignWrapper">
              <UrlWrap className="flex valignWrapper mRight10">
                <input
                  type="text"
                  value={url}
                  readOnly="readonly"
                />
                <Tooltip title={_l('新窗口打开')}>
                  <Icon
                    icon="launch"
                    className="Font20 Gray_9e pointer hoverHighlight"
                    onClick={() => {
                      window.open(`${url}?${getAppFeaturesPath}`);
                    }}
                  />
                </Tooltip>
              </UrlWrap>
              <ClipboardButton
                component="div"
                data-clipboard-text={url}
                onSuccess={() => {
                  alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方'));
                }}
              >
                <BtnWrap className="mRight10 pointer valignWrapper copy">{_l('复制')}</BtnWrap>
              </ClipboardButton>
              <Popover content={this.renderPopover(qrurl)}>
                <BtnWrap className="pointer mRight10 valignWrapper qrCode">
                  <Icon className="Font22 Gray_75" icon="qr_code" />
                </BtnWrap>
              </Popover>
              <BtnWrap
                className={cx('pointer valignWrapper code', { active: embedVisible })}
                onClick={() => {
                  this.setState({ embedVisible: !embedVisible });
                }}
              >
                <Icon className="Font20" icon="code" />
              </BtnWrap>
            </div>
            {embedVisible && this.renderEmbedPublicLink()}
          </Fragment>
        )}
      </Fragment>
    )
  }
  render() {
    const { visible, onCancel, title } = this.props;
    const { loading } = this.state;
    return (
      <Modal
        className="chartModal"
        width={720}
        visible={visible}
        title={title}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={null}
        onCancel={onCancel}
      >
        {loading ? (
          <LoadDiv className="mBottom30"/>
        ) : (
          <div className="mBottom20">
            {this.renderEmbeddedLink()}
            <Divider />
            {this.renderPublicLink()}
          </div>
        )}
      </Modal>
    )
  }
}
