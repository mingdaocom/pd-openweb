import React, { Component } from 'react';
import './shareFolderOrTask.less';
import Clipboard from 'clipboard';
import DialogLayer from 'mdDialog';

export default class ShareFolderOrTask extends Component {
  static defaultProps = {
    shareUrl: '',
    shareMessage: '',
    linkText: '',
    onClose: () => {},
  };

  render() {
    const { shareUrl, shareMessage, linkText } = this.props;
    const dialogOpts = {
      dialogBoxID: 'shareFolderOrTask',
      container: {
        header: _l('获取链接与二维码'),
        yesText: '',
        noText: '',
        noFn: this.props.onClose,
      },
      width: 520,
      readyFn: () => {
        const clipboard = new Clipboard('.createShareCopy span', {
          text() {
            return $('.createShareCopy span').attr('data-clipboard-text');
          },
        });
        clipboard.on('success', () => {
          alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
        });
      },
    };

    return (
      <DialogLayer {...dialogOpts}>
        <div className="qrCode">
          <img src={ md.global.Config.AjaxApiUrl + 'code/CreateQrCodeImage?url=' + shareUrl } />
        </div>
        <div className="createShareDesc Font16">{shareMessage}</div>
        <div className="createShareCopy Font14">
          <span data-clipboard-text={shareUrl}>
            <i />
            {linkText}
          </span>
        </div>
      </DialogLayer>
    );
  }
}
