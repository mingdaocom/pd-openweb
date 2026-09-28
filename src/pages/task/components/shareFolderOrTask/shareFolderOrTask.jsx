import React, { Component } from 'react';
import copy from 'copy-to-clipboard';
import { Modal } from 'ming-ui/antd-components';
import './shareFolderOrTask.less';

export default class ShareFolderOrTask extends Component {
  static defaultProps = {
    shareUrl: '',
    shareMessage: '',
    linkText: '',
  };

  render() {
    const { shareUrl, shareMessage, linkText } = this.props;

    return (
      <Modal
        open
        wrapClassName="shareFolderOrTask"
        title={_l('获取链接与二维码')}
        onCancel={() => {
          this.props.onClose ? this.props.onClose() : $('.shareFolderOrTask').parent().remove();
        }}
      >
        <div className="qrCode">
          <img src={md.global.Config.AjaxApiUrl + 'code/CreateQrCodeImage?url=' + shareUrl} />
        </div>
        <div className="createShareDesc Font16">{shareMessage}</div>
        <div className="createShareCopy Font14">
          <span
            data-clipboard-text={shareUrl}
            onClick={() => {
              copy($('.createShareCopy span').attr('data-clipboard-text'));
              alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
            }}
          >
            <i />
            {linkText}
          </span>
        </div>
      </Modal>
    );
  }
}
