import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui';

const UpgradeContentWrap = styled.div`
  display: flex;
  height: 100%;
  .unusualSkeletonWrap {
    width: 240px;
    height: 100%;
    background-color: var(--color-background-primary);
  }
  .unusualContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    margin: 15px;
    background-color: var(--color-background-primary);
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
      background-color: var(--color-background-secondary);
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
  background: var(--color-background-secondary);
  border-radius: 50%;
`;

const STATUS_INFO = {
  4: {
    text: _l('应用正在升级中...'),
    color: 'var(--color-success)',
  },
  10: {
    text: _l('应用正在升级中...'),
    color: 'var(--color-success)',
  },
  11: {
    text: _l('应用正在还原中...'),
    color: 'var(--color-success)',
  },
  12: {
    text: _l('应用迁移中...'),
    color: 'var(--color-error)',
    icon: 'icon-setting',
    desc: _l('该应用正在迁移数据库，暂停访问'),
  },
};

export default function UpgradeContent({ appPkg, showLeftSkeleton = true, isMobile }) {
  const { currentPcNaviStyle, appStatus } = appPkg;
  const icon = STATUS_INFO[appStatus].icon || 'icon-unarchive';

  if (isMobile) {
    return (
      <MobileWrap>
        <IconWrap>
          <i className={cx('Font48', icon)} style={{ color: STATUS_INFO[appStatus].color }} />
        </IconWrap>
        <div className="textDisabled Font17 mTop20">{STATUS_INFO[appStatus].text}</div>
        {!!STATUS_INFO[appStatus].desc && <div className="textTertiary mTop10">{STATUS_INFO[appStatus].desc}</div>}
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
          <i className={cx('Font56', icon)} style={{ color: STATUS_INFO[appStatus].color }} />
        </div>
        <div className="Font17 bold">{STATUS_INFO[appStatus].text}</div>
        {!!STATUS_INFO[appStatus].desc && (
          <div className="Font13 textTertiary mTop10">{STATUS_INFO[appStatus].desc}</div>
        )}
      </div>
    </UpgradeContentWrap>
  );
}
