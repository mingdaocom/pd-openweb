import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Clipboard from 'clipboard';
import { saveAs } from 'file-saver';
import { Tooltip } from 'ming-ui';
import { TextBlock } from './Basics';
import './ShareUrl.less';

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
`;

export default class ShareUrl extends React.Component {
  static propTypes = {
    copyShowText: PropTypes.bool,
    url: PropTypes.string,
    showPreview: PropTypes.bool,
    customBtns: PropTypes.arrayOf(
      PropTypes.shape({
        tip: PropTypes.string,
        icon: PropTypes.string,
        onClick: PropTypes.func,
      }),
    ),
    className: PropTypes.string,
    style: PropTypes.shape({}),
  };

  constructor(props) {
    super(props);
    this.state = {
      showinput: false,
    };
  }

  componentDidMount() {
    var clicboardObject = new Clipboard(this.copy, {
      text: () => this.props.url,
    });
    clicboardObject.on('success', function() {
      alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方'));
    });
    clicboardObject.on('error', function() {
      alert(_l('复制失败'), 3);
    });
  }

  render() {
    const { url, style, customBtns = [], className = '', copyShowText } = this.props;
    const { showinput } = this.state;
    const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}`;
    const qrurlDownload = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${url}&size=20&download=true`;
    return (
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
            <div className="flex ellipsis" onClick={() => this.setState({ showinput: true })}>
              {url}
            </div>
          )}
        </Url>
        {customBtns.map((btn, index) => (
          <Tooltip key={index} popupPlacement="bottom" text={<span>{btn.tip}</span>}>
            <Icon onClick={btn.onClick}>
              <i style={btn.iconStyle} className={`icon-${btn.icon}`}></i>
            </Icon>
          </Tooltip>
        ))}
        {copyShowText ? (
          <TextIcon ref={copy => (this.copy = copy)}>
            <span className="text">{_l('复制')}</span>
          </TextIcon>
        ) : (
          <Tooltip popupPlacement="bottom" text={<span>{_l('复制链接')}</span>}>
            <Icon ref={copy => (this.copy = copy)}>
              <i className="icon-content-copy"></i>
            </Icon>
          </Tooltip>
        )}
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
                  {' '}
                  {_l('点击下载')}{' '}
                </span>
              </p>
            </React.Fragment>
          }
        >
          <Icon>
            <i className="icon-qr_code Font22 LineHeight36"></i>
          </Icon>
        </Tooltip>
      </div>
    );
  }
}
