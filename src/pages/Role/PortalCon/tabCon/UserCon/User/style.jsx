import styled from 'styled-components';

export const Wrap = styled.div(
  ({ $len }) => `
  padding: 16px 10px 0 10px;
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(100% - 70px - 38px) / ${$len - 1});
  }
  .wrapTr.nameWrapTr {
    width: calc(calc(100% - 70px - 38px) / ${$len - 1}); !important;
    overflow: hidden;
  }
  .moreop {
    color: var(--color-text-tertiary);
  }
  .topAct {
    padding-right: 22px;
    min-height: 54px;
    padding-bottom: 16px;
    display: flex;
    justify-content: right;
    .act {
      .topActDrop {
        width: 180px;
        height: 36px;
        background: var(--color-background-primary);
        border: 1px solid var(--color-border-secondary);
        border-radius: 3px;
      }
    }
  }
  .isCurmemberType {
    color: var(--color-primary);
  }
`,
);
