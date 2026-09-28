import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CHANGE_STATUS, getChangeStatusLabel } from '../constants';

const STATUS_CONFIG = {
  [CHANGE_STATUS.ADDED]: {
    color: 'var(--color-success)',
    backgroundColor: 'var(--color-success-bg)',
  },
  [CHANGE_STATUS.UPDATED]: {
    color: 'var(--color-warning)',
    backgroundColor: 'var(--color-warning-bg)',
  },
  [CHANGE_STATUS.DELETED]: {
    color: 'var(--color-error)',
    backgroundColor: 'var(--color-error-bg)',
  },
};

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 24px;
  border-radius: 6px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 500;
  line-height: 24px;
  white-space: nowrap;
`;

export default function ChangeStatus({ status, className = '' }) {
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <Status className={className} $backgroundColor={config.backgroundColor} $color={config.color}>
      {getChangeStatusLabel(status)}
    </Status>
  );
}

ChangeStatus.propTypes = {
  status: PropTypes.oneOf(Object.values(CHANGE_STATUS)).isRequired,
  className: PropTypes.string,
};
