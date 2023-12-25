import React from 'react';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui';

const UpgradeContentWrap = styled.div`
  display: flex;
  height: 100%;
  .unusualSkeletonWrap {
    width: 240px;
    height: 100%;
    background-color: #fff;
  }
  .unusualContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    margin: 15px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
    .imgWrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 110px;
      height: 110px;
      line-height: 110px;
      border-radius: 50%;
      text-align: center;
      background-color: #f5f5f5;
    }
  }
`;
const MobileWrap = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const IconWrap = styled.div`
  display: flex;
  width: 130px;
  height: 130px;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  border-radius: 50%;
`;

export default function UpgradeContent({ appPkg, showLeftSkeleton = true, isMobile }) {
  const { currentPcNaviStyle } = appPkg;

  if (isMobile) {
    return (
      <MobileWrap>
        <IconWrap>
          <i className="icon-unarchive Gray_9e Font48" />
        </IconWrap>
        <div className="Gray_bd Font17 mTop20">{_l('应用正在升级中…')}</div>
      </MobileWrap>
    );
  }

  return (
    <UpgradeContentWrap>
      {showLeftSkeleton && currentPcNaviStyle !== 1 && (
        <div className="unusualSkeletonWrap">
          <Skeleton active={false} />
        </div>
      )}
      <div className="unusualContent">
        <div className="imgWrap mBottom14">
          <i className="icon-unarchive Font56" style={{ color: '#4caf50' }} />
        </div>
        <div className="Font17 bold">{_l('应用正在升级中...')}</div>
      </div>
    </UpgradeContentWrap>
  );
}
