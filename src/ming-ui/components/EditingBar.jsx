import React, { useEffect, useRef } from 'react';
import { Motion, spring } from 'react-motion';
import { useKey } from 'react-use';
import cx from 'classnames';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ConBox = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 11;
`;

const Con = styled.div`
  height: 48px;
  border-radius: 48px;
  color: #fff;
  line-height: 48px;
  padding: 0 10px 0 24px;
  z-index: 9;
  box-shadow:
    0px 6px 24px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 400px;
`;

const Loading = styled.i`
  height: 1em;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  margin-right: 10px;
  animation: rotate 2s linear infinite;
`;

const Button = styled.div`
  cursor: pointer;
  display: inline-block;
  height: 28px;
  line-height: 28px;
  padding: 0 18px;
  border-radius: 28px;
`;
const OkButton = styled(Button)`
  background-color: #fff;
  font-weight: 600;
  user-select: none;
  &:not(.disabled):hover {
    background-color: rgba(255, 255, 255, 0.9);
  }
  &.disabled {
    color: #ddd;
    cursor: not-allowed;
  }
`;
const CancelButton = styled(Button)`
  color: #fff;
  font-weight: bold;
  &:hover {
    background-color: rgba(255, 255, 255, 0.16);
  }
`;

export default function EditingBar(props) {
  const {
    style = {},
    isBlack = false,
    saveShortCut,
    loading,
    visible,
    defaultTop,
    visibleTop,
    title,
    okDisabled,
    updateText = _l('保存'),
    cancelText = _l('取消'),
    onUpdate = () => {},
    onCancel = () => {},
    onOkMouseDown = () => {},
  } = props;
  const cache = useRef({ saveShortCut, okDisabled });
  useKey('s', e => {
    if (!cache.current.saveShortCut || !(window.isMacOs ? e.metaKey : e.ctrlKey)) return;
    e.stopPropagation();
    e.preventDefault();
    if (cache.current.okDisabled) return;
    let delayTime = 0;
    if (includes(['input', 'textarea'], document.activeElement.tagName.toLowerCase())) {
      document.activeElement.blur();
      document.querySelector('.recordInfoForm').dispatchEvent(new MouseEvent('mousedown'));
      delayTime = 100;
    }
    setTimeout(() => {
      onUpdate();
    }, delayTime);
  });
  useEffect(() => {
    cache.current = { saveShortCut, okDisabled };
  }, [saveShortCut, okDisabled]);
  return (
    <Motion
      defaultStyle={{ top: defaultTop }}
      style={{
        top: spring(visible ? visibleTop : defaultTop, {
          stiffness: 300,
          damping: 30,
          precision: 0.01,
        }),
      }}
    >
      {value => (
        <ConBox
          style={Object.assign(
            {
              overflow: visible ? undefined : 'hidden',
            },
            value,
            style,
          )}
          onClick={e => e.stopPropagation()}
          className="editingBar"
        >
          <Con style={{ background: isBlack ? '#151515' : '#1677ff' }}>
            <span className="flex bold">{title}</span>
            {loading && <Loading className="icon icon-loading_button" />}
            {!loading && cancelText && (
              <CancelButton className="mLeft30  mRight10" onClick={onCancel}>
                {cancelText}
              </CancelButton>
            )}
            {!loading && (
              <OkButton
                className={cx({ disabled: okDisabled }, isBlack ? 'Gray' : 'ThemeColor3')}
                onMouseDown={onOkMouseDown}
                onClick={okDisabled ? () => {} : onUpdate}
                {...(saveShortCut && !okDisabled ? { 'data-tip': window.isMacOs ? '⌘ + S' : 'Ctrl + S' } : {})}
              >
                {updateText}
              </OkButton>
            )}
          </Con>
        </ConBox>
      )}
    </Motion>
  );
}

EditingBar.propTypes = {
  saveShortCut: PropTypes.bool,
  style: PropTypes.shape({}),
  visible: PropTypes.bool,
  okDisabled: PropTypes.bool,
  loading: PropTypes.bool,
  title: PropTypes.any,
  defaultTop: PropTypes.number,
  visibleTop: PropTypes.number,
  updateText: PropTypes.string,
  cancelText: PropTypes.string,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func,
  onOkMouseDown: PropTypes.func,
};
