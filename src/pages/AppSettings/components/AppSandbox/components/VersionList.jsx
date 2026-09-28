import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import ConfirmVersionActionDialog from 'src/components/AppSandbox/version/components/ConfirmVersionActionDialog';
import VersionActionButton from 'src/components/AppSandbox/version/components/VersionActionButton';
import VersionStatus from 'src/components/AppSandbox/version/components/VersionStatus';
import {
  getVersionActionLabel,
  getVersionActions,
  VERSION_ACTION,
  VERSION_ACTION_SCENE,
  VERSION_DETAIL_FROM,
} from 'src/components/AppSandbox/version/constants';
import VersionDetailPage from 'src/components/AppSandbox/version/detail/VersionDetailPage';
import { formatVersion } from 'src/components/AppSandbox/version/versionNumber';
import { VERSION_TABLE_COLUMNS } from '../constants';
import useVersionActions from '../hooks/useVersionActions';
import useVersions from '../hooks/useVersions';

const VersionCard = styled.section`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 326px;
  margin-top: 32px;
  overflow: hidden;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background-color: var(--color-background-primary);
`;

const VersionHeader = styled.div`
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 24px;
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;

  .Icon {
    margin-right: 8px;
    color: var(--color-text-secondary);
    font-size: 18px;
  }
`;

const VersionTableHead = styled.div`
  display: grid;
  grid-template-columns: ${VERSION_TABLE_COLUMNS};
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border-secondary);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
`;

const VersionScrollView = styled(ScrollView)`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const VersionEmpty = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .emptyIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: var(--color-background-secondary);
    color: var(--color-text-placeholder);
  }

  .description {
    color: var(--color-text-tertiary);
  }
`;

const VersionRow = styled.div`
  display: grid;
  grid-template-columns: ${VERSION_TABLE_COLUMNS};
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 48px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border-secondary);
  color: var(--color-text-primary);
  font-size: 13px;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background-color: var(--color-background-hover);
  }

  .version {
    position: relative;
    display: flex;
    align-items: center;
    font-weight: 600;

    &.isCurrent::before {
      position: absolute;
      top: 50%;
      left: -11px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: var(--color-success);
      content: '';
      transform: translateY(-50%);
    }
  }

  .publisher {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .publisherName {
    margin-left: 8px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Column = styled.div`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.versionColumn {
    overflow: visible;
  }

  &.descriptionColumn {
    margin-right: 10px;
  }

  &.timeColumn {
    margin-right: 10px;
  }
`;

function VersionColumns({ children, className }) {
  return <Column className={className}>{children}</Column>;
}

function VersionItem({ appId, version, submitting, onAction, onOpenDetail }) {
  const creator = version.creator || {};
  const actions = getVersionActions({
    from: VERSION_DETAIL_FROM.APP_MANAGEMENT,
    status: version.status,
    scene: VERSION_ACTION_SCENE.LIST,
  });

  return (
    <VersionRow>
      <VersionColumns className="versionColumn">
        <div className={cx('version', { isCurrent: version.isCurrent })}>
          {version.versionNo ? formatVersion(version.versionNo) : '—'}
        </div>
      </VersionColumns>
      <VersionColumns className="statusColumn">
        <VersionStatus status={version.status} remark={version.remark} />
      </VersionColumns>
      <VersionColumns className="descriptionColumn">{version.description || '—'}</VersionColumns>
      <VersionColumns className="publisherColumn">
        <div className="publisher">
          <UserHead size={24} appId={appId} user={{ ...creator, userHead: creator.avatar }} />
          <span className="publisherName ellipsis">{creator.fullname || '—'}</span>
        </div>
      </VersionColumns>
      <VersionColumns className="timeColumn">{version.createTime || '—'}</VersionColumns>
      <VersionColumns className="actionColumn">
        <div className="actions">
          <VersionActionButton onClick={() => onOpenDetail(version)}>{_l('查看')}</VersionActionButton>
          {actions.map(action => (
            <VersionActionButton
              key={action}
              action={action}
              disabled={submitting || (action === VERSION_ACTION.UPGRADE && version.upgrading)}
              onClick={() => onAction({ action, version })}
            >
              {action === VERSION_ACTION.UPGRADE && version.upgrading ? _l('升级中') : getVersionActionLabel(action)}
            </VersionActionButton>
          ))}
        </div>
      </VersionColumns>
    </VersionRow>
  );
}

function VersionTableHeader() {
  return (
    <VersionTableHead>
      <VersionColumns className="versionColumn">{_l('版本号')}</VersionColumns>
      <VersionColumns className="statusColumn">{_l('状态')}</VersionColumns>
      <VersionColumns className="descriptionColumn">{_l('发布说明')}</VersionColumns>
      <VersionColumns className="publisherColumn">{_l('发布者')}</VersionColumns>
      <VersionColumns className="timeColumn">{_l('申请时间')}</VersionColumns>
      <VersionColumns className="actionColumn">{_l('操作')}</VersionColumns>
    </VersionTableHead>
  );
}

export default function VersionList({ appId, onVersionsChange }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [detailVersion, setDetailVersion] = useState(null);
  const { versions, loading, loadMore, refresh } = useVersions({
    appId,
    onChange: onVersionsChange,
  });
  const handleActionSuccess = useCallback(() => {
    setDetailVersion(null);
    setConfirmAction(null);
    refresh();
  }, [refresh]);
  const { submit: submitVersionAction, submitting: actionSubmitting } = useVersionActions({
    appId,
    onSuccess: handleActionSuccess,
  });
  const handleListAction = useCallback(
    actionOptions => {
      if (actionOptions.action === VERSION_ACTION.WITHDRAW) {
        submitVersionAction(actionOptions);
        return;
      }

      setConfirmAction(actionOptions);
    },
    [submitVersionAction],
  );

  return (
    <>
      <VersionCard>
        <VersionHeader>
          <Icon icon="clock" />
          {_l('版本管理')}
        </VersionHeader>
        <VersionTableHeader />
        <VersionScrollView onScrollEnd={loadMore}>
          {versions.map(version => (
            <VersionItem
              key={version.versionId}
              appId={appId}
              version={version}
              submitting={actionSubmitting}
              onAction={handleListAction}
              onOpenDetail={setDetailVersion}
            />
          ))}
          {loading && <LoadDiv className="mTop20 mBottom20" />}
          {!loading && !versions.length && (
            <VersionEmpty>
              <div className="emptyIcon">
                <span className="icon-verify Font40" />
              </div>
              <span className="description Bold Font15 mTop20">{_l('暂无数据')}</span>
            </VersionEmpty>
          )}
        </VersionScrollView>
      </VersionCard>
      <ConfirmVersionActionDialog
        open={Boolean(confirmAction)}
        action={confirmAction?.action}
        version={confirmAction?.version}
        confirmLoading={actionSubmitting}
        onClose={() => !actionSubmitting && setConfirmAction(null)}
        onConfirm={submitVersionAction}
      />
      {detailVersion && (
        <VersionDetailPage
          open
          appId={appId}
          version={detailVersion}
          from={VERSION_DETAIL_FROM.APP_MANAGEMENT}
          onClose={() => setDetailVersion(null)}
          onReject={({ version, rejectReason }) =>
            submitVersionAction({ action: VERSION_ACTION.REJECT, version, rejectReason })
          }
          onApprove={version => submitVersionAction({ action: VERSION_ACTION.APPROVE, version })}
          onRestore={version => submitVersionAction({ action: VERSION_ACTION.RESTORE, version })}
          onWithdraw={version => submitVersionAction({ action: VERSION_ACTION.WITHDRAW, version })}
        />
      )}
    </>
  );
}

VersionList.propTypes = {
  appId: PropTypes.string.isRequired,
  onVersionsChange: PropTypes.func,
};

VersionItem.propTypes = {
  appId: PropTypes.string.isRequired,
  version: PropTypes.object.isRequired,
  submitting: PropTypes.bool.isRequired,
  onAction: PropTypes.func.isRequired,
  onOpenDetail: PropTypes.func.isRequired,
};
