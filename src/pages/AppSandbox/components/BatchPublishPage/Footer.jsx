import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { VERSION_DETAIL_HORIZONTAL_PADDING } from 'src/components/AppSandbox/version/constants';

const FooterWrap = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 64px;
  padding: 0 ${VERSION_DETAIL_HORIZONTAL_PADDING};
  box-sizing: border-box;
  border-top: 1px solid var(--color-border-secondary);
  background-color: var(--color-background-primary);
  flex-shrink: 0;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 24px;
  border: 0;
  border-radius: 3px;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: var(--color-background-hover);
  }

  &:disabled {
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  &.primary {
    background-color: var(--color-primary);
    color: var(--color-white);

    &:not(:disabled):hover {
      background-color: var(--color-primary-light);
    }

    &:not(:disabled):active {
      background-color: var(--color-primary-dark);
    }

    &:disabled {
      background-color: var(--color-background-disabled);
      color: var(--color-text-disabled);
      cursor: not-allowed;
    }
  }
`;

const noop = () => {};

export default function Footer({ submitting = false, submitDisabled = false, onClose = noop, onSubmit = noop }) {
  return (
    <FooterWrap>
      <FooterContent>
        <ActionButton type="button" disabled={submitting} onClick={onClose}>
          {_l('取消')}
        </ActionButton>
        <ActionButton className="primary" type="button" disabled={submitDisabled} onClick={onSubmit}>
          {submitting ? _l('提交中...') : _l('立即提交')}
        </ActionButton>
      </FooterContent>
    </FooterWrap>
  );
}

Footer.propTypes = {
  submitting: PropTypes.bool,
  submitDisabled: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
