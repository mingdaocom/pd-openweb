import React from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';

const SideWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 9;
  .mask {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  &.white .sideContentWrap {
    background-color: #fff;
  }
  .sideContentWrap {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 720px;
    background-color: #f5f5f5;
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.3);
    header {
      .icon-close {
        color: #9e9e9e;
        &:hover {
          color: #2196f3;
        }
      }
    }
  }
  .sideContent {
    display: flex;
    flex-direction: column;
    height: calc(100% - 56px);
    overflow: auto;
    padding: 0 24px;
  }
  header {
    padding: 0 24px;
    line-height: 56px;
    background-color: #fff;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);
    i {
      cursor: pointer;
      font-size: 16px;
    }
  }
`;

export default function sideWrap({ isMask = true, className, children, headerText, onClick, onClose }) {
  return (
    <SideWrap className={className} onClick={onClick}>
      {isMask && <div className="mask" onClick={onClose}></div>}
      <div className="sideContentWrap">
        <header>
          <div className="flexRow alignItemsCenter">{headerText}</div>
          <i className="icon-close Font22" onClick={onClose}></i>
        </header>
        <div className="sideContent">{children}</div>
      </div>
    </SideWrap>
  );
}
