import styled from 'styled-components';

const MOBILE_BREAKPOINT = '768px';

export const PageWrap = styled.div`
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: #fafafa;

  .titleTxt {
    color: #333;
  }

  .textString {
    color: #757575;
  }

  .topLine {
    border-top: 1px solid #e0e0e0;
  }

  .cancelBtn {
    border-color: #eaeaea !important;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    background-color: #fff;
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }
`;

export const Card = styled.div`
  width: 400px;
  min-height: 400px;
  max-width: 100%;
  border-radius: 12px;
  padding: 32px;
  background-color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    border: none;
    box-shadow: none;
    padding: 32px 24px 28px;
    border-radius: 0;
  }
`;

export const LogoWrap = styled.div`
  width: auto;
  height: 72px;
  display: block;
  margin: 0 auto 24px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  &.flexCenter {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &.logoPlaceholder {
    background: #1a1a1a;
  }
`;

export const ErrorIconWrap = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #fef3f2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ErrorContent = styled.div`
  padding: 46px 0 46px;
  text-align: center;
`;

export const BtnGroup = styled.div`
  .authorizeBtn {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    &:hover {
      background-color: var(--color-primary-dark) !important;
      border-color: var(--color-primary-dark) !important;
    }
  }
`;

export const ScopeListWrap = styled.ul`
  list-style: none;
  margin: 0;
  li {
    position: relative;
    padding-left: 14px;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 11px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--color-border-strong);
    }
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding-left: 4px;
    li {
      padding-left: 12px;
    }
  }
`;
