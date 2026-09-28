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
        --hap-select-height: 48px;
        height: auto !important;
        min-height: 48px !important;
      }
    }

    .mesDiv.errorDiv:not(.errorDivCu) {
      .title {
        color: var(--color-error) !important;
        top: -1px;
        transform: translateY(-50%);
      }
    }
    .mesDiv:not(.hasValue) {
      .title {
        top: 50% !important;
        transform: translateY(-50%);
      }
      .hap-select-placeholder {
        opacity: 0;
        transition: opacity 0.3s;
      }
      input[type='text']:not(.hap-select-input),
      input[type='password'] {
        &.active {
          border: 1px solid var(--color-primary) !important;
          box-shadow: var(--shadow-sm);
          .title {
            color: var(--color-primary) !important;
            top: -1px;
            transform: translateY(-50%);
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

    .mesDiv.errorDiv .controlDropdown {
      border-color: var(--color-error) !important;
    }

    .mesDiv.errorDivCu .controlDropdown {
      border-color: var(--color-primary) !important;
      box-shadow: var(--shadow-sm);
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
  }
`;
