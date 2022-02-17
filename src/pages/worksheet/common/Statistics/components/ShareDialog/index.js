import React, { Component, Fragment } from 'react';
import appManagement from 'src/api/appManagement';
import { Icon, Switch, LoadDiv } from 'ming-ui';
import { Modal, Tooltip, Popover } from 'antd';
import { BtnWrap, UrlWrap } from 'worksheet/components/CustomPageContent/ShareDialog';
import ClipboardButton from 'react-clipboard.js';
import { saveAs } from 'file-saver';
import { getAppFeaturesPath } from 'src/util';

export default class ShareDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.initConfig(nextProps);
    }
  }
  initConfig(props) {
    const { sourceId } = props;
    appManagement.getEntityShare({
      sourceId,
      sourceType: 31
    }).then(data => {
      this.setState({ data, loading: false });
    });
  }
  handleStatus = () => {
    const { sourceId } = this.props;
    const { status } = this.state.data;
    appManagement.editEntityShareStatus({
      sourceId,
      sourceType: 31,
      status: status ? 0 : 1
    }).then(result => {
      const { flag, appEntityShare } = result;
      if (flag) {
        this.setState({ data: appEntityShare });
      }
    });
  }
  renderContent() {
    const { isCharge } = this.props;
    const { data = {} } = this.state;
    const { url, status } = data;
    const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}&download=true`;
    return (
      <div className="mBottom20">
        <div className="Font15 bold mBottom16">{_l('公开分享')}</div>
        <div className="Font13 Gray_9e mBottom16">{_l('获得链接的所有人都可以查看')}</div>
        <div className="flexRow">
          <Switch
            checked={!!status}
            disabled={!isCharge}
            onClick={this.handleStatus}
          />
          <div className="mLeft8">{status ? _l('开启') : _l('关闭')}</div>
        </div>
        {!!status && (
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
              <BtnWrap className="mRight10 pointer copy valignWrapper">{_l('复制')}</BtnWrap>
            </ClipboardButton>
            <Popover
              content={(
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
              )}
            >
              <BtnWrap className="pointer qrCode valignWrapper">
                <Icon className="Font22 Gray_75" icon="qr_code" />
              </BtnWrap>
            </Popover>
          </div>
        )}
      </div>
    );
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
        {loading ? <LoadDiv className="mBottom30"/> : this.renderContent()}
      </Modal>
    )
  }
}
