import React, { Component } from 'react';
import { Dialog, Input, Button, Icon, QiniuUpload } from 'ming-ui';
import styled from 'styled-components';
import workWxIcon from '../../integration/platformIntegration/images/workwx.png';
import dingIcon from '../../integration/platformIntegration/images/ding.png';
import feishuIcon from '../../integration/platformIntegration/images/feishu.png';

const DialogWrap = styled(Dialog)`
  .mui-dialog-header {
    padding-bottom: 10px;
  }
  .uploadWrapper {
    width: 40px;
    height: 40px;
    img {
      width: 100%;
      height: 100%;
    }
    .uploadBtn {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      text-align: center;
      display: none !important;
      text-align: center;
      z-index: 2;
    }
    &:hover {
      .uploadBtn {
        display: inline-block !important;
      }
    }
  }
  .ming.Input {
    border: 1px solid #eaeaea;
  }
`;

const Wrap = styled.div`
  .iconStyle {
    width: 20px;
    height: 20px;
  }
  .iconBg {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-size: cover;
    background-repeat: no-repeat;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -moz-osx-font-smoothing: grayscale;
  }
  .defaultIcon {
    width: 30px;
    height: 30px;
  }
  .workWxIcon {
    background-image: url(${workWxIcon});
  }
  .dingIcon {
    background-image: url(${dingIcon});
  }
  .feishuIcon {
    background-image: url(${feishuIcon});
  }
`;

export default class SettingIconAndName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      iconUrl: props.iconUrl,
      name: props.name || props.defaultName,
      initIonUrl: props.iconUrl || props.defaultIcon,
      initName: props.name || props.defaultName,
    };
  }

  renderDialog = () => {
    const { defaultName, iconClassName, handleSave = () => {} } = this.props;
    const { visible, iconUrl, name } = this.state;

    const uploadOptions = {
      key: Date.now(),
      options: {
        filters: {
          mime_types: [{ extensions: 'png,jpg' }],
        },
        ext_blacklist: [],
        bucket: 4,
        type: 4,
      },
      onUploaded: (up, file) => {
        const { serverName, key, fileName } = file;
        this.setState({ iconUrl: `${serverName}${key}`, icon: fileName, file });
      },
      onError: (up, err, errTip) => {
        alert(errTip, 2);
      },
    };

    return (
      <DialogWrap
        title={_l('设置图标和名称')}
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        footer={
          <div className="footer flexRow alignItemsCenter">
            {iconUrl && (
              <div
                className=" Hand TxtLeft Gray_75"
                onClick={() => this.setState({ name: defaultName, iconUrl: '', icon: undefined, file: {} })}
              >
                {_l('恢复默认')}
              </div>
            )}
            <div className="flex"></div>
            <Button type="link" onClick={() => this.setState({ visible: false })}>
              {_l('取消')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (!name) {
                  alert(_l('名称不得为空'), 2);
                  return;
                }
                handleSave({
                  name,
                  iconUrl,
                  icon: this.state.icon,
                  file: this.state.file,
                  success: url => this.setState({ visible: false, initName: name, initIonUrl: url || iconUrl }),
                });
              }}
            >
              {_l('保存')}
            </Button>
          </div>
        }
      >
        <div className="Gray_75 pBottom20">{_l('可以自定义登录页面显示的图标和名称')}</div>
        <Wrap className="valignWrapper uploadWrapper Hand Position justifyContentCenter">
          {iconUrl ? (
            <img className="icon" src={iconUrl} />
          ) : (
            <i className={`${iconClassName} defaultIcon Gray_75 Font30 mRight5`} />
          )}
          <QiniuUpload {...uploadOptions} className="uploadBtn">
            <i className="icon icon-upload_pictures Font15 LineHeight40" />
          </QiniuUpload>
        </Wrap>
        <div className="mTop10 mBottom40 Gray_75 Font12">
          {_l('可上传PNG、JPG，图片格式推荐大小 48x48 px, 文件大小在128KB以内')}
        </div>
        <Input className="w100 input" value={name} onChange={value => this.setState({ name: value })} />
      </DialogWrap>
    );
  };

  render() {
    const { iconClassName, className } = this.props;
    const { visible, initIonUrl, initName } = this.state;

    return (
      <Wrap className={`flexRow alignItemsCenter ${className}`}>
        <span className="Gray_9e">{_l('自定义显示登录文案与图标：')}</span>
        {initIonUrl ? (
          <img className="iconStyle mRight5" src={initIonUrl} />
        ) : (
          <i className={`${iconClassName} Gray_75 Font20 mRight5`} />
        )}
        <span className="name">{initName}</span>
        <Icon
          icon="edit"
          className="Font12 mLeft8 Gray_9e Hover_21 Hand"
          onClick={() => this.setState({ visible: true })}
        />
        {visible && this.renderDialog()}
      </Wrap>
    );
  }
}
