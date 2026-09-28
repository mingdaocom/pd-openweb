import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { LoadDiv } from 'ming-ui';
import { useSandboxProjectAccess } from 'src/components/AppSandbox/hooks/useSandboxAccess';
import { useSandboxDeployment } from 'src/components/AppSandbox/hooks/useSandboxDeployment';
import ConfirmVersionActionDialog from 'src/components/AppSandbox/version/components/ConfirmVersionActionDialog';
import { VERSION_ACTION, VERSION_DETAIL_FROM, VERSION_STATUS } from 'src/components/AppSandbox/version/constants';
import VersionDetailPage from 'src/components/AppSandbox/version/detail/VersionDetailPage';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import TableEmpty from 'src/pages/Admin/common/TableEmpty';
import { SANDBOX_LIST_ORDER } from 'src/utils/domain/app/sandbox';
import { useSandboxListSelection } from '../components/SandboxList';
import { SandboxPage, SandboxPageContent, SandboxPageScroll } from '../components/SandboxPageLayout';
import Toolbar from './components/Toolbar';
import VersionList from './components/VersionList';
import { REVIEW_PAGE_SIZE } from './constants';
import useReviewVersionAction from './hooks/useReviewVersionAction';
import useReviewVersions from './hooks/useReviewVersions';
import { getPageIndexAfterAction, isReviewVersionSelectable } from './model/reviewVersion';

const UNDEPLOYED_DETAIL = { icon: 'icon-worksheet_public', desc: _l('请先部署沙盒环境') };
const UNSUPPORTED_DETAIL = { icon: 'icon-worksheet_public', desc: _l('当前版本不支持沙盒功能') };

function ReviewUpgrade({ match }) {
  const projectId = match?.params?.projectId;
  const { checking: accessChecking, canAccess } = useSandboxProjectAccess(projectId);
  const { checking: sandboxChecking, deployed } = useSandboxDeployment(projectId);
  const [appId, setAppId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [status, setStatus] = useState('');
  const [order, setOrder] = useState(SANDBOX_LIST_ORDER.DESC);
  const [pageIndex, setPageIndex] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [detailVersion, setDetailVersion] = useState(null);
  const {
    selectedIds: selectedVersionIds,
    updateSelection,
    clearSelection: clearVersionSelection,
  } = useSandboxListSelection();
  const selectedVersionIdSet = useMemo(() => new Set(selectedVersionIds), [selectedVersionIds]);
  const appIds = useMemo(() => (appId ? [appId] : []), [appId]);
  const createAccountIds = useMemo(() => applicants.map(applicant => applicant.accountId), [applicants]);
  const { items, total, loading, refresh } = useReviewVersions({
    enabled: canAccess && !sandboxChecking && deployed,
    projectId,
    appIds,
    createAccountIds,
    status,
    order,
    pageIndex,
    pageSize: REVIEW_PAGE_SIZE,
  });
  // 页面不保留跨页选择，选择状态和批量操作能力统一由当前页数据派生。
  const selectionState = useMemo(() => {
    const versionMap = new Map(items.map(item => [item.versionId, item]));
    const selectedVersions = selectedVersionIds.map(id => versionMap.get(id)).filter(Boolean);
    const firstSelectedVersion = selectedVersions.find(isReviewVersionSelectable);
    const selectedStatus = firstSelectedVersion?.status;
    const hasCompleteSelection =
      Boolean(selectedVersionIds.length) && selectedVersions.length === selectedVersionIds.length;

    return {
      status: selectedStatus,
      canBatchAction:
        hasCompleteSelection &&
        selectedVersions.every(
          version =>
            version.status === selectedStatus &&
            (selectedStatus !== VERSION_STATUS.PENDING_UPDATE || !version.upgrading),
        ),
      invalidIds: selectedVersionIds.filter(id => {
        const version = versionMap.get(id);

        return !isReviewVersionSelectable(version) || version.status !== selectedStatus;
      }),
    };
  }, [items, selectedVersionIds]);

  useEffect(() => {
    if (loading || !selectionState.invalidIds.length) return;

    updateSelection(selectionState.invalidIds, false);
  }, [loading, selectionState.invalidIds, updateSelection]);

  const updateVersionSelection = useCallback(
    (versions, checked) => {
      updateSelection(
        versions.map(version => version.versionId),
        checked,
      );
    },
    [updateSelection],
  );

  const resetListQuery = useCallback(() => {
    clearVersionSelection();
    setPageIndex(1);
  }, [clearVersionSelection]);

  const openVersionDetail = item => {
    setDetailVersion(item);
  };

  const closeVersionDetail = () => {
    setDetailVersion(null);
  };

  const handleActionSuccess = useCallback(
    ({ action, affectedCount, affectedVersionIds, isSingleVersionAction }) => {
      setConfirmAction(null);
      setDetailVersion(null);
      if (isSingleVersionAction) {
        updateSelection(affectedVersionIds, false);
      } else {
        clearVersionSelection();
      }

      const nextPageIndex = getPageIndexAfterAction({
        action,
        status,
        total,
        affectedCount,
        pageIndex,
        pageSize: REVIEW_PAGE_SIZE,
      });

      if (nextPageIndex === pageIndex) {
        refresh();
      } else {
        setPageIndex(nextPageIndex);
      }
    },
    [clearVersionSelection, pageIndex, refresh, status, total, updateSelection],
  );
  const { submitting: actionSubmitting, submit: submitVersionAction } = useReviewVersionAction({
    projectId,
    onSuccess: handleActionSuccess,
  });
  const confirmVersionAction = useCallback(
    actionOptions => submitVersionAction({ ...actionOptions, versionIds: selectedVersionIds }),
    [selectedVersionIds, submitVersionAction],
  );

  return (
    <SandboxPageScroll>
      <SandboxPage className="orgManagementWrap">
        <AdminTitle prefix={_l('沙盒环境 - 审核与升级')} />
        <div className="orgManagementHeader">
          <div className="tabBox">{_l('审核与升级')}</div>
        </div>
        {accessChecking || (canAccess && sandboxChecking) ? (
          <LoadDiv className="mTop20" />
        ) : !canAccess ? (
          <TableEmpty className="w100 h100 pTop0" detail={UNSUPPORTED_DETAIL} />
        ) : deployed ? (
          <SandboxPageContent>
            <Toolbar
              projectId={projectId}
              appId={appId}
              applicants={applicants}
              status={status}
              selectedStatus={selectionState.status}
              selectedCount={selectedVersionIds.length}
              canBatchAction={selectionState.canBatchAction}
              onAppChange={value => {
                setAppId(value);
                resetListQuery();
              }}
              onApplicantsChange={value => {
                setApplicants(value);
                resetListQuery();
              }}
              onStatusChange={value => {
                setStatus(value);
                resetListQuery();
              }}
              onApprove={() =>
                setConfirmAction({ action: VERSION_ACTION.APPROVE, batchCount: selectedVersionIds.length })
              }
              onReject={() =>
                setConfirmAction({ action: VERSION_ACTION.REJECT, batchCount: selectedVersionIds.length })
              }
              onUpgrade={() =>
                setConfirmAction({ action: VERSION_ACTION.UPGRADE, batchCount: selectedVersionIds.length })
              }
            />
            <VersionList
              items={items}
              total={total}
              loading={loading}
              order={order}
              pageIndex={pageIndex}
              selectedIdSet={selectedVersionIdSet}
              selectionStatus={selectionState.status}
              onSelect={updateVersionSelection}
              onSort={() => {
                setOrder(order === SANDBOX_LIST_ORDER.DESC ? SANDBOX_LIST_ORDER.ASC : SANDBOX_LIST_ORDER.DESC);
                resetListQuery();
              }}
              onPageChange={nextPageIndex => {
                clearVersionSelection();
                setPageIndex(nextPageIndex);
              }}
              onView={openVersionDetail}
              onAction={actionOptions => {
                if (!actionOptions.version.upgrading) setConfirmAction(actionOptions);
              }}
            />
          </SandboxPageContent>
        ) : (
          <TableEmpty className="w100 h100 pTop0" detail={UNDEPLOYED_DETAIL} />
        )}
        <ConfirmVersionActionDialog
          open={Boolean(confirmAction)}
          action={confirmAction?.action}
          version={confirmAction?.version}
          batchCount={confirmAction?.batchCount}
          confirmLoading={actionSubmitting}
          onClose={() => !actionSubmitting && setConfirmAction(null)}
          onConfirm={confirmVersionAction}
        />
        {detailVersion && (
          <VersionDetailPage
            open
            appId={detailVersion.appId}
            version={detailVersion}
            from={VERSION_DETAIL_FROM.ORGANIZATION_MANAGEMENT}
            onClose={closeVersionDetail}
            onApprove={version => confirmVersionAction({ action: VERSION_ACTION.APPROVE, version })}
            onReject={({ version, rejectReason }) =>
              confirmVersionAction({ action: VERSION_ACTION.REJECT, version, rejectReason })
            }
            onRestore={version => confirmVersionAction({ action: VERSION_ACTION.RESTORE, version })}
          />
        )}
      </SandboxPage>
    </SandboxPageScroll>
  );
}

ReviewUpgrade.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
    }),
  }),
};

export default ReviewUpgrade;
