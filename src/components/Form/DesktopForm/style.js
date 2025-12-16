import _ from 'lodash';
import styled from 'styled-components';

export const CustomFormItemControlWrap = styled.div`
  &.customFormItemControl {
    ${props => (props.isShowRefreshBtn ? 'padding-right: 19px;' : '')}
  }
  .customFormTextarea {
    ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
    line-height: ${props => (props.isTextArea ? '1.5 !important' : `${props.height - 14}px !important`)};
  }
  .customFormControlBox {
    ${props => {
      if (!props.isTextArea && props.height) {
        const paddingValue = _.includes([15, 16, 19, 23, 24, 42, 46], props.type) ? 0 : 6;
        return `height: min-content !important;min-height:${props.height}px !important;line-height:${
          props.height - 14
        }px !important;padding-top: ${paddingValue}px !important;padding-bottom: ${paddingValue}px !important;`;
      }
    }}
    ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
  ${props => (_.includes([25, 31, 32, 33, 37, 38, 53], props.type) ? props.valueStyle : '')}
  & > span:first-child {
      ${props => (_.includes([2, 3, 4, 5, 6, 7, 8, 15, 16], props.type) ? props.valueStyle : '')}
    }
    &.customFormControlTelPhone {
      ${props => props.valueStyle}
      -webkit-text-fill-color: ${props => (props.valueStyle ? 'unset' : 'var(--color-text-primary)')}
    }
    .ant-picker-input > input {
      ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
    }
    &:not(.ant-picker-focused) .ant-picker-input > input {
      ${props => (_.includes([15, 16, 46], props.type) ? props.valueStyle : '')}
    }
  }

  .numberControlBox {
    min-height: ${props => `${props.height || 36}px`};
    .iconWrap {
      height: ${props => `${(props.height || 36) * 0.4}px`};
      &:hover {
        height: ${props => `${(props.height || 36) * 0.6}px`};
      }
    }
  }

  .CityPicker-input-container {
    .CityPicker-input-textCon {
      ${props => (props.size ? `font-size: ${props.size} !important;` : '')}
    }
    &:not(.editable) .CityPicker-input-textCon {
      ${props => props.valueStyle}
    }
  }
`;

export const ControlLabel = styled.div`
  ${({ displayRow, titlewidth_pc = '100' }) => {
    if (displayRow) {
      return `width:${titlewidth_pc}px !important;`;
    }
  }}
  ${({ hasContent, displayRow, titlewidth_pc }) => {
    if (displayRow && hasContent) {
      return titlewidth_pc === '0' ? 'width: auto !important;padding-right: 10px;' : 'padding-right: 10px;';
    }
  }}
${({ displayRow }) => (displayRow ? 'padding-top: 6px !important;padding-bottom: 6px !important;' : '')}
line-height: ${({ valuesize }) => {
    const valueHeight = valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36;
    return `${valueHeight - 12}px !important`;
  }}
${({ item, showTitle }) =>
    item.type === 34 && showTitle ? 'maxWidth: calc(100% - 140px);margin-top:20px;' : 'min-height: 0px !important;'}
.controlLabelName {
    ${({ displayRow, align_pc = '1', showTitle }) => {
      if (displayRow) {
        if (!showTitle) {
          return 'display: none;';
        }
        return align_pc === '1' ? 'text-align: left;' : 'text-align: right;flex: 1;';
      } else {
        if (!showTitle) {
          return 'visibility: hidden;';
        }
      }
    }}
    font-size: ${props => props.titleSize};
    color: ${props => props.titleColor};
    ${props => props.titleStyle || ''};
  }
  .requiredBtnBox .customFormItemLoading {
    line-height: ${({ valuesize }) => {
      const valueHeight = valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36;
      return `${valueHeight - 12}px !important`;
    }};
  }
  &.isRelateRecordTable,
  &.isRelationSearchTable {
    .controlLabelName {
      margin: 14px 0 0;
      font-size: 15px;
      color: var(--color-text-primary);
    }
    .descBoxInfo {
      margin: 14px 0 0;
    }
  }
`;
