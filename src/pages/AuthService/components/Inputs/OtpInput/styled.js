import styled from 'styled-components';

export const WrapCon = styled.div`
  margin-top: 16px;
  .otp-input-container {
    display: flex;
    gap: 12px;
    margin: 0 auto;
    justify-content: center;
    margin-top: 32px;
  }

  .otp-input {
    text-align: center;
    font-size: 48px;
    box-sizing: border-box;
    outline: none;
    border: none;
    border-bottom: 2px solid #e0e0e0;
    font-weight: 400;
    background: transparent;
    border-radius: 0;
    color: #141414;
    transition: border-color 0.2s;
    flex-shrink: 0;
    width: 48px;
    height: 60px;
    line-height: 48px;
    padding: 0;
    padding-bottom: 12px;
    -webkit-text-size-adjust: 100%;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    &:focus {
      background: transparent !important;
      border-bottom: 2px solid #2e77fa;
      color: #141414 !important;
    }
    &::placeholder {
      color: transparent;
    }
    /* 防止移动端自动填充样式覆盖 */
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: #141414 !important;
      -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  .otp-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    font-size: 15px;
    a {
      color: var(--color-text-secondary);
      text-decoration: none;
      &:hover {
        color: var(--color-text-title);
      }
    }
  }

  /* 小屏幕下调整输入框大小和间距，防止超出容器 */
  @media screen and (max-width: 600px) {
    .otp-input-container {
      gap: 8px;
    }

    .otp-input {
      width: 40px;
      font-size: 40px;
      height: 56px;
      line-height: 40px;
    }
  }

  /* 超小屏幕下进一步缩小 */
  @media screen and (max-width: 375px) {
    .otp-input-container {
      gap: 6px;
    }

    .otp-input {
      width: 36px;
      font-size: 36px;
      height: 52px;
      line-height: 36px;
    }
  }
`;
