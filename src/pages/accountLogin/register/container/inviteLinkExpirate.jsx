import React from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  min-height: 400px;
  img {
    margin: 0 auto;
    display: block;
  }

  .btnForLogin {
    margin: 64px auto 0;
    width: 236px;
    height: 40px;
    background: #2296f3;
    opacity: 1;
    border-radius: 4px;
    display: block;
    color: #fff;
    line-height: 40px;
    text-decoration: none;

    &:hover {
      background: #1e88e5;
    }
  }
`;
export default class InviteLinkExpirate extends React.Component {
  render() {
    return (
      <Wrap>
        <div className="TxtCenter">
          <div className="Font20 mTop40 Gray">{_l('链接已失效')}</div>
          <div className="Gray_75 mTop16 Font15">{_l('邀请已取消或者过期，可通过快速注册联系邀请人')}</div>
          <a className="btnForLogin Hand" href="/register">
            {_l('快速注册')}
          </a>
        </div>
      </Wrap>
    );
  }
}
