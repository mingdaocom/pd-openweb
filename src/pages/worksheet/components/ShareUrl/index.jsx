import React, { Fragment } from 'react';
import { Popover } from 'antd';
import copy from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { TextBlock } from 'worksheet/components/Basics';
import SendToChat from './SendToChat';
import './ShareUrl.less';

const Url = styled(TextBlock)`
  overflow: hidden;
  input {
    border: none;
    background: inherit;
    font-size: inherit;
    width: 100%;
    margin-left: -1px;
    height: 36px;
    line-height: 36px;
  }
  .icon-refresh {
    &:hover {
      color: #1677ff !important;
    }
  }
`;

const Icon = styled(TextBlock)`
  cursor: pointer;
  padding: 0;
  width: 36px;
  color: #757575;
  font-size: 18px;
  text-align: center;
  margin-left: 6px;
  :hover {
    color: #1677ff;
  }
  ${({ theme }) =>
    theme === 'light' &&
    `
    background: #fff;
    border: 1px solid #ddd;
    :hover {
      border-color: #1677ff;
    }
  `}
`;

const InputIcon = styled.span`
  cursor: pointer;
  color: #9d9d9d;
  font-size: 14px;
  margin-left: 6px;
  :hover {
    color: #1677ff;
  }
`;

const TextIcon = styled(TextBlock)`
  cursor: pointer;
  line-height: 36px;
  display: inline-block;
  padding: 0 20px;
  color: #151515;
  font-size: 13px;
  font-weight: 500;
  margin-left: 6px;
  :hover {
    color: #1677ff;
  }
  ${({ theme }) =>
    theme === 'light' &&
    `
    background: #fff;
    border: 1px solid #ddd;
    :hover {
      border-color: #1677ff;
    }
  `}
`;

const SeparateDisplayButton = styled(TextBlock)`
  cursor: pointer;
  line-height: 36px;
  width: 80px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 5px;
  color: #151515;
  font-size: 13px;
  font-weight: 500;
  i {
    color: #757575;
    font-size: 18px;
  }

  :hover {
    color: #1677ff;
    i {
      color: #1677ff;
    }
  }
  ${({ theme }) =>
    theme === 'light' &&
    `
    background: #fff;
    border: 1px solid #ddd;
    :hover {
      border-color: #1677ff;
    }
  `}
`;

const Danger = styled.span`
  color: #f44336;
`;

export default class ShareUrl extends React.Component {
  static propTypes = {
    copyShowText: PropTypes.bool,
    url: PropTypes.string,
    theme: PropTypes.string,
    allowSendToChat: PropTypes.bool,
    qrVisible: PropTypes.bool,
    copyTip: PropTypes.string,
    customBtns: PropTypes.arrayOf(
      PropTypes.shape({
        tip: PropTypes.string,
        icon: PropTypes.string,
        text: PropTypes.string,
        showCompletely: PropTypes.bool,
        onClick: PropTypes.func,
      }),
    ),
    className: PropTypes.string,
    style: PropTypes.shape({}),
    getCopyContent: PropTypes.func,
    showCompletely: PropTypes.shape({
      copy: PropTypes.bool,
      qr: PropTypes.bool,
    }),
    refreshShareUrl: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      showinput: false,
    };
  }

  async handleCopy(content) {
    const { getCopyContent } = this.props;
    copy(_.isFunction(getCopyContent) ? await getCopyContent(content) : content);
    alert(_l('复制成功'));
  }

  handleRefreshShareUrl() {
    const { refreshShareUrl } = this.props;
    Dialog.confirm({
      buttonType: 'danger',
      title: <Danger> {_l('确认生成新链接吗？')} </Danger>,
      description: _l('如果您选择生成新链接，则旧链接将不再可用'),
      onOk: refreshShareUrl,
    });
  }

  render() {
    const {
      url,
      style,
      inputBtns = [],
      customBtns = [],
      className = '',
      theme = 'default',
      copyShowText,
      allowSendToChat = false,
      qrVisible = true,
      copyTip,
      chatCard,
      editUrl,
      editTip,
      showCompletely = {},
      refreshShareUrl,
    } = this.props;
    const { showinput, chatVisible } = this.state;
    const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}`;
    const qrurlDownload = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}&size=20&download=true`;
    const renderButtons = (btn, index) =>
      btn.showCompletely ? (
        <SeparateDisplayButton style={btn.style} theme={theme} onClick={btn.onClick}>
          <i style={btn.iconStyle} className={`icon-${btn.icon}`}></i>
          <span>{btn.text}</span>
        </SeparateDisplayButton>
      ) : (
        <Tooltip key={index} placement="bottom" title={btn.tip}>
          <Icon style={btn.style} theme={theme} className={btn.className} onClick={btn.onClick}>
            <i style={btn.iconStyle} className={`icon-${btn.icon}`}></i>
          </Icon>
        </Tooltip>
      );
    const renderCopy = () => {
      const renderCopyDom = () => {
        return (
          <SeparateDisplayButton theme={theme} onClick={() => this.handleCopy(url)} style={showCompletely.style}>
            <i className="icon-content-copy" style={showCompletely.iconStyle}></i>
            <span className="text">{_l('复制')}</span>
          </SeparateDisplayButton>
        );
      };
      return !copyTip ? (
        renderCopyDom()
      ) : (
        <Tooltip placement="bottomLeft" title={copyTip}>
          {renderCopyDom()}
        </Tooltip>
      );
    };
    return (
      <Fragment>
        <div className={`flexRow ${className}`} style={style}>
          <Url className="flex flexRow shareInput" title={url}>
            {showinput ? (
              <input
                type="text"
                id="linkContent"
                onBlur={() => this.setState({ showinput: false })}
                value={url}
                readonly="readonly"
                ref={input => {
                  if (input) input.select();
                }}
              />
            ) : (
              <React.Fragment>
                <div
                  className="flex ellipsis"
                  onClick={() => {
                    this.setState({ showinput: true });
                    copy(url);
                    alert(_l('复制成功'));
                  }}
                >
                  {url}
                </div>
                {refreshShareUrl && (
                  <Tooltip placement="bottom" title={_l('重新生成链接')}>
                    <i
                      className="icon-refresh Font18 InlineBlock Hand Gray_9e LineHeight36 mLeft10"
                      onClick={() => this.handleRefreshShareUrl()}
                    ></i>
                  </Tooltip>
                )}
                {editUrl && (
                  <Tooltip placement="bottom" title={editTip}>
                    <i
                      className="icon-edit Font18 InlineBlock Hand Gray_9e LineHeight36"
                      onClick={e => {
                        e.stopPropagation();
                        editUrl();
                      }}
                    ></i>
                  </Tooltip>
                )}
              </React.Fragment>
            )}
            {inputBtns.map((btn, index) => (
              <Tooltip key={index} placement="bottom" title={btn.tip}>
                <InputIcon theme={theme} onClick={btn.onClick}>
                  <i style={btn.iconStyle} className={`icon-${btn.icon}`}></i>
                </InputIcon>
              </Tooltip>
            ))}
          </Url>
          <div className="flexRow">
            {customBtns.map(renderButtons)}
            {showCompletely.copy ? (
              renderCopy()
            ) : copyShowText ? (
              !copyTip ? (
                <TextIcon theme={theme} className="copy" onClick={() => this.handleCopy(url)}>
                  <span className="text">{_l('复制')}</span>
                </TextIcon>
              ) : (
                <Tooltip placement="bottom" title={copyTip}>
                  <TextIcon theme={theme} className="copy" onClick={() => this.handleCopy(url)}>
                    <span className="text">{_l('复制')}</span>
                  </TextIcon>
                </Tooltip>
              )
            ) : (
              <Tooltip placement="bottom" title={_l('复制链接')}>
                <Icon theme={theme} className="copy" onClick={() => this.handleCopy(url)}>
                  <i className="icon-content-copy"></i>
                </Icon>
              </Tooltip>
            )}
            {qrVisible && (
              <Popover
                overlayClassName="qrHoverPanel"
                placement="bottomRight"
                align={{
                  overflow: { adjustX: true, adjustY: true },
                }}
                content={
                  <React.Fragment>
                    <img src={qrurl} />
                    <p className="ThemeColor3 pBottom8">
                      <span
                        className="Hand"
                        onClick={() => {
                          saveAs(qrurlDownload, 'qrcode.jpg');
                        }}
                      >
                        {_l('点击下载')}
                      </span>
                    </p>
                  </React.Fragment>
                }
              >
                {showCompletely.qr ? (
                  <SeparateDisplayButton theme={theme} style={showCompletely.style}>
                    <i className="icon-qr_code Font22 LineHeight36" style={showCompletely.iconStyle}></i>
                    <span className="text">{_l('二维码')}</span>
                  </SeparateDisplayButton>
                ) : (
                  <Icon theme={theme} className="Hand qrCode">
                    <i className="icon-qr_code Font22 LineHeight36"></i>
                  </Icon>
                )}
              </Popover>
            )}

            {allowSendToChat && !md.global.SysSettings.forbidSuites.includes('6') && (
              <Tooltip placement="bottom" title={_l('发消息')}>
                <Icon
                  style={chatVisible ? { borderColor: '#1677ff' } : {}}
                  theme={theme}
                  onClick={() => {
                    this.setState({ chatVisible: !chatVisible });
                  }}
                >
                  <i
                    style={chatVisible ? { color: '#1677ff' } : { color: '#F79104' }}
                    className={`icon-${chatVisible ? 'arrow-up-border' : 'replyto'}`}
                  ></i>
                </Icon>
              </Tooltip>
            )}
          </div>
        </div>
        {chatVisible && <SendToChat card={chatCard} url={url} onClose={() => this.setState({ chatVisible: false })} />}
      </Fragment>
    );
  }
}
