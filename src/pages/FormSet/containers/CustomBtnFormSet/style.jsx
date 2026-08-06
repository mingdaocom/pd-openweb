import styled from 'styled-components';

export const Con = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-background-primary);
  .topBox {
    position: relative;
    background: none !important;
    .bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 3px 3px 0px 0px;
      border-top: 1px solid #000;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
    }
    .moreActive {
      z-index: 1;
      color: var(--color-text-secondary) !important;
    }
    span {
      position: relative;
      color: var(--color-text-title) !important;
    }
    input {
      z-index: 1;
      position: relative;
    }
  }
  .trash {
    color: var(--color-text-secondary);
    .trashIcon {
      color: var(--color-text-tertiary);
    }
    &:hover {
      color: var(--color-primary);
      .trashIcon {
        color: var(--color-primary);
      }
    }
  }
  .line {
    border-top: 1px solid var(--color-border-secondary);
    width: 100%;
    margin-top: 8px;
  }
  .customBtnSearch {
    width: 320px;
    height: 36px;
    margin: 16px 0 12px 0;
    padding: 0 16px;
    border: 1px solid var(--color-border-primary);
    border-radius: 18px;
    box-sizing: border-box;
    background: var(--color-background-primary);
    .searchIcon {
      flex-shrink: 0;
      color: var(--color-text-tertiary);
    }
    input {
      flex: 1;
      min-width: 0;
      height: 34px;
      line-height: 34px;
      margin-left: 10px;
      border: none;
      background: transparent;
      color: var(--color-text-primary);
      &::placeholder {
        color: var(--color-text-placeholder);
      }
    }
    .clearIcon {
      flex-shrink: 0;
      color: var(--color-text-tertiary);
      &:hover {
        color: var(--color-text-secondary);
      }
    }
  }
`;

export const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent var(--color-text-tertiary) transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent var(--color-primary) transparent;
  }
`;

export const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: var(--color-text-tertiary) transparent transparent transparent;
  cursor: pointer;
  margin-top: 2px;
  &:hover,
  &.active {
    border-color: var(--color-primary) transparent transparent transparent;
  }
`;
