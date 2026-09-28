import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Popup } from 'ming-ui/antd-mobile-components';

const POPUP_STOP_PROPAGATION_EVENTS = ['click', 'touchstart'];

const StyledPopup = styled(Popup)`
  .renamePopupBody {
    padding: 10px;
    background: var(--color-background-card);
  }
  .renameInput {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 90px;
    padding: 10px;
    resize: none;
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    outline: none;
    font-size: 14px;
    line-height: 20px;
    color: var(--color-text-primary);
    background: var(--color-background-card);
    &:focus {
      border-color: var(--color-primary);
    }
  }
  .renameFooter {
    display: flex;
    gap: 10px;
    padding-top: 14px;
  }
  .renameButton {
    flex: 1;
    height: 34px;
    border: 1px solid var(--color-border-primary);
    border-radius: 17px;
    font-size: 13px;
    color: var(--color-text-secondary);
    background: var(--color-background-card);
    &.save {
      border-color: var(--color-primary);
      color: var(--color-white);
      background: var(--color-primary);
    }
    &:disabled {
      cursor: default;
      opacity: 0.5;
    }
  }
`;

export default function RenamePopup({ value, maxLength = 100, placeholder, onSubmit, onClose }) {
  const [inputValue, setInputValue] = useState(value);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 100);

    return () => window.clearTimeout(timer);
  }, []);

  const submit = async () => {
    const nextValue = inputValue.trim();

    if (!nextValue) {
      alert(placeholder, 3);
      inputRef.current?.focus();
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      await onSubmit(nextValue);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <StyledPopup
      visible
      position="top"
      bodyClassName="renamePopupBody"
      stopPropagation={POPUP_STOP_PROPAGATION_EVENTS}
      onMaskClick={onClose}
      onClose={onClose}
    >
      <textarea
        ref={inputRef}
        className="renameInput"
        maxLength={maxLength}
        placeholder={placeholder}
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
      />
      <div className="renameFooter">
        <button type="button" className="renameButton" disabled={submitting} onClick={onClose}>
          {_l('取消')}
        </button>
        <button type="button" className="renameButton save" disabled={submitting} onClick={submit}>
          {_l('保存')}
        </button>
      </div>
    </StyledPopup>
  );
}

RenamePopup.propTypes = {
  value: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
