import React from 'react';
import PropTypes from 'prop-types';
import styled, { createGlobalStyle } from 'styled-components';
import { Icon } from 'ming-ui';

const CONTROL_HEIGHT_MAP = {
  '1em': 39,
  '1.2em': 44,
  '1.4em': 49,
  '1.6em': 53,
  '1.8em': 58,
};
const ICON_SIZE_MAP = {
  '1em': 28,
  '1.2em': 30,
  '1.4em': 32,
  '1.6em': 34,
  '1.8em': 36,
};
const ICON_PADDING = 6;
export const CLEAR_ICON_SAFE_AREA = 36;
export const CLEAR_ICON_SAFE_CLASS = 'clearValueIconSafeArea';

const getIconSize = size => ICON_SIZE_MAP[size] || ICON_SIZE_MAP['1em'];

const getIconFontSize = size => getIconSize(size) - ICON_PADDING * 2;

const getIconTop = size => {
  const controlHeight = CONTROL_HEIGHT_MAP[size] || 36;
  return (controlHeight - getIconSize(size)) / 2;
};

const ClearIconWrap = styled.span`
  position: absolute;
  right: 8px;
  z-index: 2;
  width: 28px;
  height: 28px;
  padding: ${ICON_PADDING}px;
  box-sizing: border-box;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  .icon {
    color: var(--color-text-tertiary);
  }
`;

const ClearIconSafeAreaStyle = createGlobalStyle`
  .${CLEAR_ICON_SAFE_CLASS} {
    > input.customFormControlBox,
    > textarea.customFormTextarea {
      padding-right: ${CLEAR_ICON_SAFE_AREA}px !important;
    }
  }
`;

export default function ClearValueIcon(props) {
  const { className, onClear, size } = props;
  const iconSize = getIconSize(size);

  const handleClear = event => {
    event.preventDefault();
    event.stopPropagation();
    onClear(event);
  };

  return (
    <React.Fragment>
      <ClearIconSafeAreaStyle />
      <ClearIconWrap
        className={className}
        style={{ top: getIconTop(size), width: iconSize, height: iconSize, fontSize: getIconFontSize(size) }}
        title={_l('清空内容')}
        onMouseDown={event => event.preventDefault()}
        onClick={handleClear}
      >
        <Icon icon="cancel" style={{ fontSize: 'inherit' }} />
      </ClearIconWrap>
    </React.Fragment>
  );
}

ClearValueIcon.propTypes = {
  className: PropTypes.string,
  onClear: PropTypes.func,
  size: PropTypes.string,
};

ClearValueIcon.defaultProps = {
  onClear: () => {},
  size: '1em',
};
