import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import { Tooltip } from 'ming-ui';
import { TextBlock } from 'worksheet/components/Basics';
import SendToChat from './SendToChat';
import './ShareUrl.less';
import _ from 'lodash';

const Url = styled(TextBlock)`
  overflow: hidden;
  input {
    border: none;
    background: inherit;
    font-size: inherit;
    width: 100%;
    margin-left: -1px;
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
    color: #2196f3;
  }
  ${({ theme }) =>
    theme === 'light' &&
    `
    background: #fff;
    border: 1px solid #ddd;
    :hover {
      border-color: #2196f3;
    }
  `}
`;

const InputIcon = styled.span`
  cursor: pointer;
  color: #9d9d9d;
  font-size: 14px;
  margin-left: 6px;
  :hover {
    color: #2196f3;
  }
`;

const TextIcon = styled(TextBlock)`
  cursor: pointer;
  line-height: 36px;
  display: inline-block;
  padding: 0 20px;
  color: #333;
  font-size: 13px;
  font-weight: 500;
  margin-left: 6px;
  :hover {
    color: #2196f3;
  }
  ${({ theme }) =>
    theme === 'light' &&
    `
    background: #fff;
    border: 1px solid #ddd;
    :hover {
      border-color: #2196f3;
    }
  `}
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
        onClick: PropTypes.func,
      }),
    ),
    className: PropTypes.string,
    style: PropTypes.shape({}),
    getCopyContent: PropTypes.func,
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
    } = this.props;
    const { showinput, chatVisible } = this.state;
    const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}`;
    const qrurlDownload = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}&size=20&download=true`;
    const renderButtons = (btn, index) => (
      <Tooltip key={index} popupPlacement="bottom" text={<span>{btn.tip}</span>}>
        <Icon style={btn.style} theme={theme} onClick={btn.onClick}>
          <i style={btn.iconStyle} className={`icon-${btn.icon}`}></i>
        </Icon>
      </Tooltip>
    );
    return (
      <Fragment>
        <div className={`flexRow ${className}`} style={style}>
          <Url className="flex flexRow" title={url}>
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
                {editUrl && (
                  <Tooltip popupPlacement="bottom" text={<span>{editTip}</span>}>
                    <i
                      className="icon-new_mail Font18 InlineBlock Hand Gray_9e LineHeight36"
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
              <Tooltip key={index} popupPlacement="bottom" text={<span>{btn.tip}</span>}>
                <InputIcon theme={theme} onClick={btn.onClick}>
                  <i style={btn.iconStyle} className={`icon-${btn.icon}`}></i>
                </InputIcon>
              </Tooltip>
            ))}
          </Url>
          {customBtns.map(renderButtons)}
          {copyShowText ? (
            !copyTip ? (
              <TextIcon theme={theme} onClick={() => this.handleCopy(url)}>
                <span className="text">{_l('复制')}</span>
              </TextIcon>
            ) : (
              <Tooltip popupPlacement="bottom" text={<span>{copyTip}</span>}>
                <TextIcon theme={theme} onClick={() => this.handleCopy(url)}>
                  <span className="text">{_l('复制')}</span>
                </TextIcon>
              </Tooltip>
            )
          ) : (
            <Tooltip popupPlacement="bottom" text={<span>{_l('复制链接')}</span>}>
              <Icon theme={theme} onClick={() => this.handleCopy(url)}>
                <i className="icon-content-copy"></i>
              </Icon>
            </Tooltip>
          )}
          {qrVisible && (
            <Tooltip
              themeColor="white"
              tooltipClass="qrHoverPanel"
              popupPlacement="bottom"
              popupAlign={{
                offset: [-9, 9],
                points: ['tc', 'bc'],
              }}
              text={
                <React.Fragment>
                  <img src={qrurl} />
                  <p className="ThemeColor3">
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
              <Icon theme={theme} className="Hand">
                <i className="icon-qr_code Font22 LineHeight36"></i>
              </Icon>
            </Tooltip>
          )}
          {allowSendToChat && (
            <Tooltip popupPlacement="bottom" text={<span>{_l('发消息')}</span>}>
              <Icon
                style={chatVisible ? { borderColor: '#2196f3' } : {}}
                theme={theme}
                onClick={() => {
                  this.setState({ chatVisible: !chatVisible });
                }}
              >
                <i
                  style={chatVisible ? { color: '#2196f3' } : { color: '#F79104' }}
                  className={`icon-${chatVisible ? 'arrow-up-border' : 'replyto'}`}
                ></i>
              </Icon>
            </Tooltip>
          )}
        </div>
        {chatVisible && <SendToChat card={chatCard} url={url} onClose={() => this.setState({ chatVisible: false })} />}
      </Fragment>
    );
  }
}
