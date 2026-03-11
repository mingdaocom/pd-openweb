import React from 'react';
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
  &.btnSideContentWrap {
    .sideContentWrap {
      background-color: var(--color-background-secondary);
    }
  }
  .sideContentWrap {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 720px;
    background-color: var(--color-background-card);
    box-shadow: var(--shadow-xl);
    header {
      .icon-close {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-primary);
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
    .buttonDisplayWrap {
      padding: 20px 0;
    }
  }
  header {
    padding: 0 24px;
    line-height: 56px;
    background-color: var(--color-background-card);
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--shadow-md);
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
