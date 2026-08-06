import React from 'react';
import styled from 'styled-components';
import { pathCompletion } from 'src/utils/common';

const Wrap = styled.div`
  min-height: 400px;
  img {
    margin: 0 auto;
    display: block;
  }

  .btnForLogin {
    margin: 64px auto 0;
    width: 236px;
    height: 48px;
    background: var(--color-primary);
    opacity: 1;
    border-radius: 6px;
    display: block;
    color: var(--color-text-inverse);
    line-height: 48px;
    text-decoration: none;

    &:hover {
      background: var(--color-primary-dark);
    }

    &:active {
      background: var(--color-primary-dark);
    }
  }
`;
export default class InviteLinkExpirate extends React.Component {
  render() {
    return (
      <Wrap>
        <div className="TxtCenter">
          <div className="Font28 Bold mTop40 textPrimary">{_l('链接已失效')}</div>
          <div className="textSecondary mTop16 Font15">{_l('邀请已取消或者过期，可通过快速注册联系邀请人')}</div>
          <a className="btnForLogin Hand Bold" href={pathCompletion('/register')}>
            {_l('快速注册')}
          </a>
        </div>
      </Wrap>
    );
  }
}
