import React, { Fragment } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Modal, Popover, Tooltip } from 'ming-ui/antd-components';
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
      color: var(--color-primary) !important;
    }
  }
`;

const InputIcon = styled.span`
  cursor: pointer;
  color: var(--color-text-tertiary);
  font-size: 14px;
  margin-left: 6px;
  &:hover {
    color: var(--color-primary);
  }
`;

const Danger = styled.span`
  color: var(--color-error);
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
    const copyContent = _.isFunction(getCopyContent) ? await getCopyContent(content) : content;
    // 只去掉整串末尾的空问号；链接后面还跟着说明文字时必须保留问号，
    // 否则说明文字会被 IM/动态的链接识别一起吞进 pathname，落地页取到的 id 就带上了文字
    copy(copyContent.replace(/\?$/, ''));
    alert(_l('复制成功'));
  }

  handleRefreshShareUrl() {
    const { refreshShareUrl } = this.props;
    Modal.confirm({
      okButtonProps: {
        danger: true,
      },
      title: <Danger> {_l('确认生成新链接吗？')} </Danger>,
      content: _l('如果您选择生成新链接，则旧链接将不再可用'),
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
      copyText,
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
    const encodeUrl = encodeURIComponent(url);
    const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${encodeUrl}`;
    const qrurlDownload = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${encodeUrl}&size=20&download=true`;

    const renderButtons = (btn, index) =>
      btn.showCompletely ? (
        <Button
          key={index}
          color="default"
          variant={theme === 'light' ? 'outlined' : 'filled'}
          style={btn.style}
          icon={<i style={btn.iconStyle} className={`icon-${btn.icon}`} />}
          onClick={btn.onClick}
        >
          {btn.text}
        </Button>
      ) : (
        <Tooltip key={index} placement="bottom" title={btn.tip}>
          <Button
            aria-label={btn.tip}
            className={cx('mLeft6', btn.className)}
            color="default"
            variant={theme === 'light' ? 'outlined' : 'filled'}
            style={btn.style}
            icon={<i style={btn.iconStyle} className={`icon-${btn.icon} Font18`} />}
            onClick={btn.onClick}
          />
        </Tooltip>
      );

    const renderCopy = () => {
      const renderCopyDom = () => {
        return (
          <Button
            color="default"
            variant={theme === 'light' ? 'outlined' : 'filled'}
            icon={<i className="icon-content-copy" style={showCompletely.iconStyle} />}
            onClick={() => this.handleCopy(url)}
            style={showCompletely.style}
          >
            {copyText || _l('复制')}
          </Button>
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
                      className="icon-refresh Font18 InlineBlock Hand textTertiary LineHeight36 mLeft10"
                      onClick={() => this.handleRefreshShareUrl()}
                    ></i>
                  </Tooltip>
                )}
                {editUrl && (
                  <Tooltip placement="bottom" title={editTip}>
                    <i
                      className="icon-edit Font18 InlineBlock Hand textTertiary LineHeight36"
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
                <Button
                  className="copy mLeft6"
                  color="default"
                  variant={theme === 'light' ? 'outlined' : 'filled'}
                  onClick={() => this.handleCopy(url)}
                >
                  <span className="text">{copyText || _l('复制')}</span>
                </Button>
              ) : (
                <Tooltip placement="bottom" title={copyTip}>
                  <Button
                    className="copy mLeft6"
                    color="default"
                    variant={theme === 'light' ? 'outlined' : 'filled'}
                    onClick={() => this.handleCopy(url)}
                  >
                    <span className="text">{copyText || _l('复制')}</span>
                  </Button>
                </Tooltip>
              )
            ) : (
              <Tooltip placement="bottom" title={_l('复制链接')}>
                <Button
                  aria-label={_l('复制链接')}
                  className="copy mLeft6"
                  color="default"
                  variant={theme === 'light' ? 'outlined' : 'filled'}
                  icon={<i className="icon-content-copy Font18" />}
                  onClick={() => this.handleCopy(url)}
                />
              </Tooltip>
            )}
            {qrVisible && (
              <Popover
                arrow={true}
                classNames={{ root: 'qrHoverPanel' }}
                noPadding
                placement="bottomRight"
                content={
                  <React.Fragment>
                    <img src={qrurl} />
                    <p className="colorPrimary pBottom8">
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
                  <Button
                    color="default"
                    variant={theme === 'light' ? 'outlined' : 'filled'}
                    icon={<i className="icon-qr_code Font22" style={showCompletely.iconStyle} />}
                    style={showCompletely.style}
                  >
                    {_l('二维码')}
                  </Button>
                ) : (
                  <Button
                    aria-label={_l('二维码')}
                    className="qrCode mLeft6"
                    color="default"
                    variant={theme === 'light' ? 'outlined' : 'filled'}
                    icon={<i className="icon-qr_code Font22" />}
                  />
                )}
              </Popover>
            )}

            {allowSendToChat && !md.global.SysSettings.forbidSuites.includes('6') && (
              <Tooltip placement="bottom" title={_l('发消息')}>
                <Button
                  aria-label={_l('发消息')}
                  className="mLeft6"
                  color="default"
                  variant={theme === 'light' ? 'outlined' : 'filled'}
                  style={chatVisible ? { borderColor: 'var(--color-primary)' } : {}}
                  icon={
                    <i
                      style={chatVisible ? { color: 'var(--color-primary)' } : { color: 'var(--color-warning)' }}
                      className={`icon-${chatVisible ? 'arrow-up-border' : 'replyto'} Font18`}
                    />
                  }
                  onClick={() => {
                    this.setState({ chatVisible: !chatVisible });
                  }}
                />
              </Tooltip>
            )}
          </div>
        </div>
        {chatVisible && <SendToChat card={chatCard} url={url} onClose={() => this.setState({ chatVisible: false })} />}
      </Fragment>
    );
  }
}
