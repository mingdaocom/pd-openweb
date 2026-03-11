import styled from 'styled-components';

export const CustomMobileCascadeControl = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  ${props => (props.hasMultipleValues ? 'padding-top: 4px !important; padding-bottom: 4px !important;' : '')}
  .cascadeMultipleContentBox {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    gap: 10px;
  }
`;

export const OptionWrap = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  .splitLine {
    height: 18px;
    border-right: 1px solid var(--color-border-primary);
  }
  .Radio,
  .Checkbox {
    flex: 1;
    display: flex;
    align-items: center;
    &-box {
      flex-shrink: 0;
    }
  }
  .simpleContent {
    flex: 1;
    word-break: break-all;
    white-space: wrap !important;
  }
`;

export const PopupContentBox = styled.div`
  height: 100%;
  .cascadeOptionBox {
    padding-left: 12px;
    font-size: 15px;
    .optionItem {
      display: flex;
      align-items: center;
      padding: 12px 12px 12px 0;
      border-bottom: 1px solid var(--color-border-secondary);
      &:last-child {
        border-bottom: none;
      }
    }
  }
  .Radio,
  .Checkbox {
    display: flex !important;
    align-items: center;
    margin-top: initial !important;
    margin-right: 20px;
    &-box {
      flex-shrink: 0;
      margin-right: 12px !important;
    }
    &-text {
      font-size: 15px !important;
      word-break: break-all;
      white-space: wrap !important;
    }
  }

  .highlight {
    color: var(--color-primary);
    vertical-align: initial !important;
  }

  .errorInfoBox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 70%;

    .icon {
      margin-bottom: 16px;
      font-size: 120px;
      color: var(--color-text-disabled);
    }
    .errorInfo {
      font-size: 17px;
    }
  }

  .breadcrumbBox {
    padding: 10px 15px;
    word-break: break-all;
    white-space: wrap;
    font-size: 15px;
    color: var(--color-primary);
  }
`;
