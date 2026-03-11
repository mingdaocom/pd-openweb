import styled from 'styled-components';

export const TabsSettingPopover = styled.div`
  width: 300px;
  border-radius: 6px;
  .ant-input {
    height: 36px;
    border-radius: 4px !important;
    box-shadow: none !important;
  }
  .typeSelect {
    font-size: 13px;
    border-radius: 3px;
    width: max-content;
    padding: 3px;
    background-color: var(--color-background-tertiary);
    > div {
      height: 25px;
      line-height: 25px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .active {
      color: var(--color-primary) !important;
      border-radius: 3px;
      font-weight: bold;
      background-color: var(--color-background-card);
    }
  }
  .icon-trash:hover {
    color: var(--color-error) !important;
  }
`;
