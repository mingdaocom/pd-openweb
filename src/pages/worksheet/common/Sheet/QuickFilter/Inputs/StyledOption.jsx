import styled from 'styled-components';

const Option = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 2px 6px 2px 0;
  color: var(--color-text-title);
  padding: 0 12px;
  height: 28px;
  border: 1px solid var(--color-border-primary);
  border-radius: 26px;
  max-width: 200px;
  user-select: none;
  &.checked {
    color: var(--color-white);
    border-color: var(--color-primary) !important;
    background-color: var(--color-primary);
    &.multiple {
      .selectedIcon {
        font-size: 16px;
        margin: 0 5px 0 -6px;
      }
      color: var(--color-link-hover);
      background-color: var(--color-primary-transparent);
      border: 1px solid rgba(21, 101, 192, 0.17) !important;
    }
  }
  &:hover {
    border-color: var(--color-border-tertiary);
  }
`;

export default Option;
