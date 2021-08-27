import React from 'react';
import styled from 'styled-components';

const SkeletonWrap = styled.div`
  flex: 1;
  .wrap {
    margin: 20px 0 0;
  }
  .title {
    width: 120px;
    height: 18px;
    margin-left: 5%;
    border-radius: 16px;
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
    background-color: #f7f7f7;
  }
`;

export default function AppGroupSkeleton() {
  return (
    <SkeletonWrap>
      <div className="wrap">
        <div className="title skeletonItem"></div>
        <div className="appList">
          {Array.from({ length: 2 }).map((_, index) => {
            return (
              <div key={index} className="appSkeletonWrap flexColumn valignWrapper">
                <div className="app skeletonItem"></div>
                <div className="name skeletonItem"></div>
                <div className="name subName skeletonItem"></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="wrap pTop10">
        <div className="title skeletonItem"></div>
        <div className="appList">
          {Array.from({ length: 4 }).map((_, index) => {
            return (
              <div key={index} className="appSkeletonWrap flexColumn valignWrapper">
                <div className="app skeletonItem"></div>
                <div className="name skeletonItem"></div>
                <div className="name subName skeletonItem"></div>
              </div>
            );
          })}
        </div>
      </div>
    </SkeletonWrap>
  );
}
