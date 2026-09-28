import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getVersionStatusLabel, VERSION_STATUS } from '../constants';

const STATUS_STYLE = {
  [VERSION_STATUS.PENDING_APPROVAL]: {
    color: 'var(--color-warning)',
    backgroundColor: 'var(--color-warning-bg)',
  },
  [VERSION_STATUS.PENDING_UPDATE]: {
    color: 'var(--color-warning)',
    backgroundColor: 'var(--color-warning-bg)',
  },
  [VERSION_STATUS.UPGRADED]: {
    color: 'var(--color-success)',
    backgroundColor: 'var(--color-success-bg)',
  },
  [VERSION_STATUS.REVERTED]: {
    color: 'var(--color-text-tertiary)',
    backgroundColor: 'var(--color-background-disabled)',
  },
  [VERSION_STATUS.REJECTED]: {
    color: 'var(--color-error)',
    backgroundColor: 'var(--color-error-bg)',
  },
  [VERSION_STATUS.INVALID]: {
    color: 'var(--color-text-tertiary)',
    backgroundColor: 'var(--color-background-disabled)',
  },
};

const StatusWrap = styled.span`
  display: inline-flex;
  align-items: center;
`;

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 10px;
  border-radius: 10px;
  background-color: ${props => props.$backgroundColor};
  color: ${props => props.$color};
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
`;

const RejectReasonIcon = styled(Icon)`
  margin-left: 6px;
  color: var(--color-text-tertiary);
  font-size: 16px;
  cursor: default;
`;

export default function VersionStatus({ status, remark = '', className = '', showRejectReasonIcon = true }) {
  const style = STATUS_STYLE[status];

  if (!style) return null;

  return (
    <StatusWrap className={className}>
      <Status $backgroundColor={style.backgroundColor} $color={style.color}>
        <span className="statusText">{getVersionStatusLabel(status)}</span>
      </Status>
      {showRejectReasonIcon && status === VERSION_STATUS.REJECTED && (
        <Tooltip title={remark || _l('暂无驳回原因')} placement="top">
          <RejectReasonIcon icon="info_outline" />
        </Tooltip>
      )}
    </StatusWrap>
  );
}

VersionStatus.propTypes = {
  status: PropTypes.oneOf(Object.values(VERSION_STATUS)).isRequired,
  remark: PropTypes.string,
  className: PropTypes.string,
  showRejectReasonIcon: PropTypes.bool,
};
