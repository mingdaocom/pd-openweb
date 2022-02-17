import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';

const EmbedWrap = styled.div`
  .embedContainer {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  .embedTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    i {
      color: #9e9e9e;
      &:hover {
        color: #2196f3;
      }
    }
  }
`;

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.string,
  };

  state = {
    value: '',
  };

  componentDidMount() {
    this.setValue();
    this.embedWatch = setInterval(this.setValue, 3000);
  }

  setValue = () => {
    if (this.props.value && this.props.value !== this.state.value) {
      this.setState({ value: this.props.value });
    }
  };

  componentWillUnmount() {
    clearInterval(this.embedWatch);
  }

  render() {
    const { advancedSetting = {}, controlName } = this.props;
    const { value } = this.state;

    const isLegalLink = /^https?:\/\/.+$/.test(value);

    return (
      <EmbedWrap>
        <div className="embedTitle">
          <span className="overflow_ellipsis Bold Gray_75 Font13">{controlName}</span>
          {advancedSetting.allowlink === '1' && (
            <Tooltip text={<span>{_l('新页面打开')}</span>}>
              <Icon className="Hand Font18" icon="launch" onClick={() => window.open(value)} />
            </Tooltip>
          )}
        </div>
        <div className="embedContainer">
          {isLegalLink ? (
            <iframe
              className="overflowHidden Border0 TxtTop"
              width="100%"
              height={advancedSetting.height || 400}
              src={value}
            ></iframe>
          ) : (
            <div className="Gray_9e BGF7F7F7 Font15 crossCenter" style={{ height: `${advancedSetting.height || 400}px` }}>
              {_l('嵌入链接无法解析')}
            </div>
          )}
        </div>
      </EmbedWrap>
    );
  }
}
