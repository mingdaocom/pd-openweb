import React from 'react';
import styled from 'styled-components';
import { FlexCenter } from 'worksheet/components/Basics';
import bgPng from '../assets/empty.png';

const FullCon = styled(FlexCenter)`
  flex: 1;
  .noNetworkBox {
    margin: 70px auto;
    align-items: center;
    justify-content: center;
    &.noNetworkBoxBorder {
      border-bottom: 1px solid #eaeaea;
      padding-top: 90px;
      padding-bottom: 90px;
    }
    .noNetworkBoxBG {
      img {
        width: 256px;
        height: 131px;
      }
    }
    .joinNetwork,
    .createNetwork {
      margin: 0 16px;
      padding: 0 32px;
      height: 44px;
      line-height: 44px;
      box-sizing: border-box;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      color: #fff;
      font-size: 14px;
    }
    .createNetwork {
      border-width: 1px;
      border-style: solid;
      &:not(:hover) {
        background: #fff !important;
      }
      &:hover {
        color: #fff !important;
      }
    }
  }
`;

const JoinGroupCon = styled.div`
  .joinOrCreateProject {
    width: 460px;
    margin: 0 auto;
    margin-top: 24px;
    font-size: 14px;
    padding: 0 30px;
    line-height: 44px;
    background: rgba(33, 150, 243, 0.08);
    border-radius: 22px;
    color: #757575;
    span {
      color: #2196f3;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

export default function NoProjectsStatus(props) {
  const { hasExternalApps } = props;
  if (hasExternalApps) {
    return (
      <JoinGroupCon>
        <div className="joinOrCreateProject">
          {_l('您还未拥有任何组织！')}
          {/* <span onClick={() => window.open('/enterpriseRegister.htm?type=create', '__blank')}>{_l('创建 ')}</span> 或 */}
          <span onClick={() => window.open('/enterpriseRegister.htm?type=add', '__blank')}>{_l('加入')}</span>
          {_l('组织，开始创建您的应用')}
        </div>
      </JoinGroupCon>
    );
  }
  return (
    <FullCon>
      <div className="noNetworkBox flexColumn">
        <div className="noNetworkBoxBG">
          <img src={bgPng} alt="" />
        </div>
        <div className="Font20 bold mTop40">{_l('申请加入一个组织，开始创建应用')}</div>
        <div className="flexRow mTop50">
          <button
            type="button"
            className="joinNetwork ThemeBGColor3 ThemeHoverBGColor2"
            onClick={() => window.open('/enterpriseRegister.htm?type=add', '__blank')}
          >
            {_l('加入组织')}
          </button>
          {/* <button
            type="button"
            className="createNetwork ThemeBGColor3 ThemeBorderColor3 ThemeColor3"
            onClick={() => window.open('/enterpriseRegister.htm?type=create', '__blank')}
          >
            {_l('创建组织')}
          </button> */}
        </div>
      </div>
    </FullCon>
  );
}
