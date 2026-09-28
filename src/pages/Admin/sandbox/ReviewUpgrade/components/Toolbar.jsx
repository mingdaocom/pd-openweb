import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import VersionActionButton, {
  VERSION_ACTION_BUTTON_VARIANT,
} from 'src/components/AppSandbox/version/components/VersionActionButton';
import {
  getVersionActionLabel,
  getVersionActions,
  getVersionStatusOptions,
  VERSION_ACTION,
  VERSION_ACTION_SCENE,
  VERSION_DETAIL_FROM,
  VERSION_STATUS,
} from 'src/components/AppSandbox/version/constants';
import SelectApp from 'src/pages/Admin/components/SelectApp';
import SelectUser from 'src/pages/Admin/components/SelectUser';

const ToolbarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 36px;

  .appSelect,
  .applicantSelect {
    width: 180px;
  }

  .statusSelect {
    width: 120px;
  }
`;

const BatchActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const SelectedCount = styled.span`
  margin-right: 8px;
  color: var(--color-text-primary);

  .count {
    color: var(--color-primary);
  }
`;

export default function Toolbar({
  projectId,
  appId,
  applicants,
  status,
  selectedStatus,
  selectedCount,
  canBatchAction,
  onAppChange,
  onApplicantsChange,
  onStatusChange,
  onApprove,
  onReject,
  onUpgrade,
}) {
  const statusOptions = [{ value: '', label: _l('全部状态') }, ...getVersionStatusOptions()];
  const batchActions = getVersionActions({
    from: VERSION_DETAIL_FROM.ORGANIZATION_MANAGEMENT,
    status: selectedStatus,
    scene: VERSION_ACTION_SCENE.LIST,
  });
  const actionHandlers = {
    [VERSION_ACTION.APPROVE]: onApprove,
    [VERSION_ACTION.REJECT]: onReject,
    [VERSION_ACTION.UPGRADE]: onUpgrade,
  };

  return (
    <ToolbarWrap>
      <SelectApp className="appSelect" projectId={projectId} value={appId} onChange={onAppChange} />
      <SelectUser
        className="applicantSelect"
        projectId={projectId}
        userInfo={applicants}
        placeholder={_l('搜索')}
        isAdmin
        changeData={onApplicantsChange}
      />
      <Select
        className="mdAntSelect statusSelect"
        value={status}
        options={statusOptions}
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        onChange={onStatusChange}
      />
      {Boolean(batchActions.length) && (
        <BatchActions>
          <SelectedCount>
            {_l('已选择')}&nbsp;<span className="count">{selectedCount}</span>&nbsp;{_l('项')}
          </SelectedCount>
          {batchActions.map(action => (
            <VersionActionButton
              key={action}
              action={action}
              variant={VERSION_ACTION_BUTTON_VARIANT.PILL}
              disabled={!canBatchAction}
              onClick={actionHandlers[action]}
            >
              {getVersionActionLabel(action)}
            </VersionActionButton>
          ))}
        </BatchActions>
      )}
    </ToolbarWrap>
  );
}

Toolbar.propTypes = {
  projectId: PropTypes.string,
  appId: PropTypes.string,
  applicants: PropTypes.arrayOf(PropTypes.shape({ accountId: PropTypes.string })),
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedStatus: PropTypes.oneOf(Object.values(VERSION_STATUS)),
  selectedCount: PropTypes.number.isRequired,
  canBatchAction: PropTypes.bool.isRequired,
  onAppChange: PropTypes.func.isRequired,
  onApplicantsChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onUpgrade: PropTypes.func.isRequired,
};
