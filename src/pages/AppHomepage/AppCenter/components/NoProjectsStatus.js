import React from 'react';
import styled from 'styled-components';
import { FlexCenter } from 'worksheet/components/Basics';
import bgPng from '../assets/empty.png';

const FullCon = styled(FlexCenter)`
  height: 128px;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 200px;
    height: 100px;
    margin-right: 24px;
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
          <span onClick={() => window.open('/enterpriseRegister?type=add', '__blank')}>{_l('加入')}</span>
          {_l('组织，开始创建您的应用')}
        </div>
      </JoinGroupCon>
    );
  }
  return (
    <FullCon>
      <img src={bgPng} alt="" />
      <div className="Font14 bold">
        <span
          className="ThemeColor pointer mLeft5 mRight5"
          onClick={() => window.open('/enterpriseRegister?type=add', '__blank')}
        >
          {_l('申请加入')}
        </span>
        <span>{_l('组织，创建自己的应用')}</span>
      </div>
    </FullCon>
  );
}
