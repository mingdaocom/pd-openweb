import styled from 'styled-components';

export const Button = styled.div`
  line-height: 36px;
  text-align: center;
  background-color: var(--color-background-primary);
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid var(--color-border-primary);
  transition: all 0.25s;
  i {
    margin-right: 4px;
    &.active {
      color: var(--color-success);
    }
  }
  &:hover {
    background-color: var(--color-background-hover);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.01);
  }
`;

export const DropdownOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-background-primary);
  min-height: 36px;
  overflow: auto;
  border-radius: 3px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.24);
  padding: 6px 0;
  max-width: 310px;
  .searchWrap {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 16px;
    margin-bottom: 6px;
    border-bottom: 1px solid --color-background-disabled;
    input {
      line-height: 36px;
      border: none;
      outline: none;
      padding-left: 8px;
    }
  }

  .dropdownContent {
    width: 100%;
    max-height: 320px;
    overflow-y: auto;
    .emptyText {
      margin: 0 auto;
      line-height: 38px;
      color: var(--color-text-tertiary);
      font-size: 13px;
      text-align: center;
    }
    .item {
      display: flex;
      align-items: center;
      line-height: 36px;
      padding: 0 16px;
      cursor: pointer;
      transition: background-color color 0.25s;
      i {
        margin-right: 8px;
        color: var(--color-text-tertiary);
      }
      .text {
        margin-right: 6px;
      }
      &.invalid {
        color: var(--color-error);
        i {
          color: var(--color-error);
        }
        &:not(disabled):hover {
          background-color: var(--color-error);
          color: var(--color-white);
          i {
            color: var(--color-white);
          }
        }
      }
      &.delete {
        &:not(disabled):hover {
          background-color: rgba(251, 0, 56, 0.08);
          color: var(--color-error);
          i {
            color: var(--color-error);
          }
        }
      }
      &.disabled {
        cursor: not-allowed;
        color: var(--color-text-disabled);
      }
      &:not(disabled):hover {
        background-color: var(--color-primary);
        color: var(--color-white);
        i {
          color: var(--color-white);
        }
      }
    }
  }
`;
