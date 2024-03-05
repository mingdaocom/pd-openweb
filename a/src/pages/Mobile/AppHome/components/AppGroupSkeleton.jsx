import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';

const SkeletonWrap = styled.div`
  flex: 1;
  .wrap {
  }
  .title {
    width: 110px;
    height: 20px;
    margin-left: 5%;
    border-radius: 10px;
  }
  .app {
    width: 55px;
    height: 55px;
    border-radius: 50%;
  }
  .appList {
    display: flex;
    flex-wrap: wrap;
  }

  .appSkeletonWrap {
    width: 25%;
    flex-shrink: 0;
    margin-top: 20px;
  }
  .name {
    width: 55px;
    margin-top: 12px;
    height: 13px;
    border-radius: 8px;
    &.subName {
      width: 35px;
      margin-top: 6px;
    }
  }
  .skeletonItem {
    background: #000000;
    opacity: 0.02;
  }

  .billboards {
    height: 160px;
    margin: 0 16px 32px;
    background: #000000;
    opacity: 0.02;
    border-radius: 8px;
  }
`;

export default function AppGroupSkeleton() {
  return (
    <SkeletonWrap>
      <div className="billboards"></div>
      <div className="wrap">
        <div className="title skeletonItem"></div>
        <div className="appList">
          {Array.from({ length: 4 }).map((_, index) => {
            return (
              <div key={index} className="appSkeletonWrap flexColumn valignWrapper">
                <div className="app skeletonItem"></div>
                <div className="name skeletonItem"></div>
                <div className={cx('name subName skeletonItem', { Hidden: index === 1 || index === 2 })}></div>
              </div>
            );
          })}
        </div>
      </div>
    </SkeletonWrap>
  );
}
