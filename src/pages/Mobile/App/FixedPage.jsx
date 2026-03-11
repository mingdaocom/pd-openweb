import React, { Component } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import Back from '../components/Back';

const FixedContent = styled.div`
  width: 100%;
  height: calc(100% - 80px);
  overflow-y: auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 31px;
  .iconInfo {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    text-align: center;
    background-color: var(--color-background-secondary);
    margin-top: 110px;
    .Font48 {
      font-size: 48px;
    }
    i {
      line-height: 110px;
    }
  }
  .fixeding {
    color: var(--color-text-title);
    font-size: 17px;
  }
  .fixedInfo {
    color: var(--color-text-tertiary);
    font-size: 14px;
  }
  .fixRemark {
    font-size: 13px;
    color: var(--color-text-title);
  }
`;

export default class FixedPage extends Component {
  render() {
    const { fixAccount = {}, fixRemark, isNoPublish, backVisible = true } = this.props;
    const { fullName } = fixAccount;
    if (isNoPublish) {
      return (
        <FixedContent>
          <div className="iconInfo mBottom18" style={{ marginTop: document.body.clientHeight / 4 }}>
            <Icon className="Font56 textSecondary" icon="computer" />
          </div>
          <div className="Font18 mBottom20 centerAlign fixeding">
            <div>{_l('应用未在此平台发布')}</div>
            <div>{_l('请至PC端使用')}</div>
          </div>
          {backVisible && (
            <Back
              icon="home"
              style={{ bottom: '20px' }}
              onClick={() => {
                window.mobileNavigateTo('/mobile/dashboard');
              }}
            />
          )}
        </FixedContent>
      );
    }
    return (
      <FixedContent>
        <div className="iconInfo mBottom25">
          <Icon className="Font48" icon="setting" style={{ color: '#fd7558' }} />
        </div>
        <div className="Font18 mBottom20 fixeding">{_l('应用维护中...')}</div>
        <div className="fixedInfo mBottom20">{_l('该应用被%0设置为维护中状态,暂停访问', fullName)}</div>
        <div className="fixRemark">{fixRemark}</div>
        {backVisible && (
          <Back
            icon="home"
            style={{ bottom: '20px' }}
            onClick={() => {
              window.mobileNavigateTo('/mobile/dashboard');
            }}
          />
        )}
      </FixedContent>
    );
  }
}
