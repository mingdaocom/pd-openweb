import React from 'react';
import { buriedUpgradeVersionDialog } from 'src/util';
import styled from 'styled-components';

const UpgradeVersionWrap = styled.div`
  background-color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .payUpgradeBtn {
    margin-top: 48px;
    box-sizing: border-box;
    border-radius: 20px;
    width: 240px !important;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #fff;
    font-size: 14px;
    background-color: #2196f3 !important;
    cursor: pointer;
  }
`;

export default function UpgradeVersion(props) {
  const { projectId, featureId } = props;

  return <UpgradeVersionWrap>{buriedUpgradeVersionDialog(projectId, featureId, 'content')}</UpgradeVersionWrap>;
}
