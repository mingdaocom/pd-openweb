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
    span {
      position: relative;
      color: var(--color-text-title) !important;
    }
    input {
      z-index: 1;
      position: relative;
    }
  }
  .line {
    border-top: 1px solid var(--color-border-secondary);
    width: 100%;
    margin-top: 8px;
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
