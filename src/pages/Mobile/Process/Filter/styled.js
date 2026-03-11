import styled from 'styled-components';

export const OptionWrap = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-block;
  margin: 0 12px 12px 0;
  color: var(--color-text-title);
  padding: 4px 12px;
  border-radius: 28px;
  max-width: 200px;
  user-select: none;
  background-color: var(--color-background-secondary);
  &.checked {
    color: var(--color-white);
    border-color: var(--color-primary);
    background-color: var(--color-primary);
  }
`;

export const SidebarWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: var(--color-background-primary);
  width: 100%;
  height: calc(100% - 45px);
  padding: 20px 20px 0;
  .overflowY {
    overflow-y: auto;
    margin-right: -10px;
  }
`;
