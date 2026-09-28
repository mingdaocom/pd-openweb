import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  compareVersions,
  DEFAULT_VERSION,
  getNextPatchVersion,
  isVersionComplete,
  normalizeVersion,
  parseVersion,
} from '../versionNumber';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .dot {
    width: 8px;
    color: var(--color-text-primary);
    text-align: center;
  }

  .tip {
    margin-left: 12px;
    color: var(--color-text-secondary);
    font-size: 13px;
    line-height: 20px;

    &.bottom {
      width: 100%;
      margin: 6px 0 0;
    }

    &.error {
      color: var(--color-error);
    }
  }
`;

const NumberInput = styled.input`
  width: 60px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid ${({ $invalid }) => ($invalid ? 'var(--color-error)' : 'var(--color-border-tertiary)')};
  border-radius: 4px;
  box-sizing: border-box;
  background-color: var(--color-background-input);
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 20px;
  text-align: center;

  &:not(:disabled):hover {
    border-color: ${({ $invalid }) => ($invalid ? 'var(--color-error)' : 'var(--color-text-disabled)')};
  }

  &:not(:disabled):focus {
    border-color: ${({ $invalid }) => ($invalid ? 'var(--color-error)' : 'var(--color-primary)')};
  }

  &:disabled {
    background-color: var(--color-background-secondary);
    color: var(--color-text-secondary);
    cursor: not-allowed;
  }
`;

const noop = () => {};

export default function VersionNumber({
  value = DEFAULT_VERSION,
  onChange = noop,
  disabled = false,
  minimumVersion = '',
  tip = null,
  tipPosition = 'right',
}) {
  const [parts, setParts] = useState(() => parseVersion(value));
  const currentVersion = parts.join('.');
  const normalizedMinimumVersion = normalizeVersion(minimumVersion);
  const hasMinimumVersion = isVersionComplete(normalizedMinimumVersion);
  const invalid =
    !disabled &&
    hasMinimumVersion &&
    (!isVersionComplete(currentVersion) || compareVersions(currentVersion, normalizedMinimumVersion) <= 0);

  const handleChange = (nextValue, index) => {
    const nextParts = parts.map((part, partIndex) => (partIndex === index ? nextValue.replace(/\D/g, '') : part));
    const nextVersion = nextParts.join('.');

    setParts(nextParts);
    onChange(nextVersion);
  };

  const handleBlur = () => {
    if (!invalid) return;

    const nextVersion = getNextPatchVersion(normalizedMinimumVersion);
    const nextParts = parseVersion(nextVersion);

    setParts(nextParts);
    onChange(nextVersion);
  };

  return (
    <Wrapper>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="dot">.</span>}
          <NumberInput
            inputMode="numeric"
            value={part}
            disabled={disabled}
            $invalid={invalid}
            maxLength={3}
            onChange={event => handleChange(event.target.value, index)}
            onBlur={handleBlur}
          />
        </React.Fragment>
      ))}
      {tip && <span className={`tip ${tipPosition} ${invalid ? 'error' : ''}`}>{tip}</span>}
    </Wrapper>
  );
}

VersionNumber.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  minimumVersion: PropTypes.string,
  tip: PropTypes.node,
  tipPosition: PropTypes.oneOf(['right', 'bottom']),
};
