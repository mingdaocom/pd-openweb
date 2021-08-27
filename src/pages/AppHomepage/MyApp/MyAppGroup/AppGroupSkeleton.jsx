import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SkeletonWrap = styled.div`
  flex: 1;
  padding: 0 8%;
  .title {
    width: 132px;
    height: 30px;
    margin-top: 56px;
    border-radius: 16px;
  }
  .app {
    width: 88px;
    height: 88px;
    margin: 0 auto;
    border-radius: 50%;
  }
  .appList {
    display: flex;
    flex-wrap: wrap;
  }
  .wrap {
    max-width: 900px;
    margin: 0 auto;
  }

  .appSkeletonWrap {
    width: 150px;
    flex-shrink: 0;
    margin-top: 40px;
  }
  .name {
    width: 96px;
    margin: 0 auto;
    margin-top: 12px;
    height: 16px;
    border-radius: 8px;
    &.subName {
      width: 56px;
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
          {Array.from({ length: 8 }).map((_, index) => {
            return (
              <div key={index} className="appSkeletonWrap">
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
