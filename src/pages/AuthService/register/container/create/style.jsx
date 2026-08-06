import styled from 'styled-components';

export const Wrap = styled.div`
  &.messageBox {
    &.createOrgForm {
      margin-top: 24px;

      .mesDiv {
        margin-top: 28px;
        height: 48px;

        &.mesDivDrop {
          height: 48px;
          min-height: 48px;
        }
      }

      .controlDropdown {
        height: 48px !important;
        min-height: 48px !important;
      }

      .Dropdown--border,
      .dropdownTrigger .Dropdown--border {
        height: 48px !important;
        min-height: 48px !important;
      }

      .Dropdown--input {
        height: 48px !important;
        min-height: 48px !important;
        padding: 0 5px !important;

        .Dropdown--placeholder,
        .icon-arrow-down-border,
        .value {
          line-height: 48px !important;
        }

        .value {
          display: flex !important;
          align-items: center;
        }
      }
    }

    .mesDiv.errorDiv:not(.errorDivCu) {
      .title {
        color: var(--color-error) !important;
        top: -1px;
        transform: translateY(-50%);
      }
      input[type='text']:not(.iti__search-input),
      input[type='password'],
      .Dropdown--input,
      .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
        .Dropdown--placeholder {
          opacity: 1;
        }
      }
    }
    .mesDiv:not(.hasValue) {
      .title {
        top: 50% !important;
        transform: translateY(-50%);
      }
      input:not(.iti__search-input) .icon-arrow-down-border,
      .Dropdown--input .icon-arrow-down-border {
        position: absolute;
        right: 12px;
        top: 0;
      }
      input[type='text']:not(.iti__search-input),
      input[type='password'],
      .Dropdown--input,
      .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
        .Dropdown--placeholder {
          opacity: 0;
          transition: all 0.3s;
        }
        &.active {
          border: 1px solid var(--color-primary) !important;
          box-shadow: var(--shadow-sm);
          .title {
            color: var(--color-primary) !important;
            top: -1px;
            transform: translateY(-50%);
          }
          .Dropdown--placeholder {
            opacity: 1;
          }
        }
      }
      &.errorDiv {
        .title {
          top: -1px !important;
          transform: translateY(-50%);
        }
      }
      &.hasValue {
        .title {
          top: -1px !important;
          transform: translateY(-50%);
        }
      }
    }
  }
`;
export const WrapCon = styled.div`
  position: absolute;
  top: 100%;
  background: var(--color-background-primary);
  z-index: 10;
  width: 100%;
  padding: 6px 0;
  box-shadow: 0px 8px 16px rgb(0 0 0 / 24%);
  border-radius: 6px;
  overflow: auto;
  max-height: 400px;
  .cover {
    position: fixed;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  & > div.liBox {
    padding: 6px 8px;
    &:hover,
    &.isCur {
      background: var(--color-primary);
      color: var(--color-text-inverse);
      .colorPrimary {
        color: var(--color-text-inverse) !important;
      }
    }
  }
`;

export const WrapConDp = styled.div`
  .controlDropdown {
    height: auto;
    .itemT {
      background: var(--color-background-secondary);
      border-radius: 6px;
      padding: 3px 8px 3px 10px;
      border: 1px solid var(--color-border-secondary);
      line-height: 20px;
      i {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-text-secondary);
        }
      }
    }
    span.itemSpan {
      color: var(--color-text-title) !important;
      font-size: 14px;
    }
    .ming.Item .Item-content:not(.disabled):hover {
      span.itemSpan {
        color: var(--color-text-inverse) !important;
        font-size: 14px;
      }
    }
    .Dropdown--border,
    .dropdownTrigger .Dropdown--border {
      height: auto !important;
    }
    .Dropdown--input {
      height: auto !important;
      min-height: 48px;
      padding: 4px !important;
      .Dropdown--placeholder {
        line-height: 40px !important;
      }
      .icon-arrow-down-border {
        line-height: 40px !important;
      }
      .value {
        line-height: 40px !important;
        display: flex !important;
        & > div {
          flex: 1 !important;
          display: flex !important;
          flex-flow: row wrap !important;
          gap: 5px;
        }
      }
    }
  }
`;
