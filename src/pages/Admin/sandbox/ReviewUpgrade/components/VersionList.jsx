import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, UserHead } from 'ming-ui';
import { Checkbox } from 'ming-ui/antd-components';
import VersionActionButton from 'src/components/AppSandbox/version/components/VersionActionButton';
import VersionStatus from 'src/components/AppSandbox/version/components/VersionStatus';
import {
  getVersionActionLabel,
  getVersionActions,
  VERSION_ACTION,
  VERSION_ACTION_SCENE,
  VERSION_DETAIL_FROM,
  VERSION_STATUS,
} from 'src/components/AppSandbox/version/constants';
import { formatVersion } from 'src/components/AppSandbox/version/versionNumber';
import TableEmpty from 'src/pages/Admin/common/TableEmpty';
import { SANDBOX_LIST_ORDER } from 'src/utils/domain/app/sandbox';
import SandboxList, {
  AppInfo,
  SANDBOX_LIST_ACTION_COLUMN_WIDTH,
  SANDBOX_LIST_CHECKBOX_COLUMN_WIDTH,
  SandboxListCheckboxCell,
  SandboxListRow,
  SandboxListSortHeader,
} from '../../components/SandboxList';
import { REVIEW_PAGE_SIZE } from '../constants';
import { isReviewVersionSelectable } from '../model/reviewVersion';

const Applicant = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;

  .applicantName {
    margin-left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`;

const Description = styled.div`
  min-width: 0;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const REVIEW_LIST_COLUMNS = `${SANDBOX_LIST_CHECKBOX_COLUMN_WIDTH} minmax(220px, 1.35fr) minmax(100px, 0.6fr) minmax(90px, 0.5fr) minmax(150px, 1fr) minmax(170px, 0.9fr) minmax(140px, 0.8fr) ${SANDBOX_LIST_ACTION_COLUMN_WIDTH}`;
const EMPTY_DETAIL = { icon: 'icon-worksheet_public', desc: _l('暂无数据') };

export default function VersionList({
  items,
  total,
  loading,
  order,
  pageIndex,
  selectedIdSet,
  selectionStatus,
  onSelect,
  onSort,
  onPageChange,
  onView,
  onAction,
}) {
  return (
    <SandboxList
      columns={REVIEW_LIST_COLUMNS}
      header={
        <>
          <SandboxListCheckboxCell />
          <div>{_l('应用名称')}</div>
          <div>{_l('状态')}</div>
          <div>{_l('版本')}</div>
          <div>{_l('发布说明')}</div>
          <SandboxListSortHeader
            $disabled={loading || !items.length}
            onClick={loading || !items.length ? undefined : onSort}
          >
            {_l('申请时间')}
            <span className="sortIcons">
              <Icon icon="arrow-up" className={order === SANDBOX_LIST_ORDER.ASC ? 'colorPrimary' : ''} />
              <Icon icon="arrow-down" className={order === SANDBOX_LIST_ORDER.DESC ? 'colorPrimary' : ''} />
            </span>
          </SandboxListSortHeader>
          <div>{_l('申请者')}</div>
          <div />
        </>
      }
      total={total}
      pageIndex={pageIndex}
      pageSize={REVIEW_PAGE_SIZE}
      onPageChange={onPageChange}
    >
      {loading ? (
        <LoadDiv className="mTop20" />
      ) : items.length ? (
        items.map(item => {
          const app = item.app || {};
          const appName = app.appName || app.name || '';
          const selectable = isReviewVersionSelectable(item) && (!selectionStatus || item.status === selectionStatus);
          const creator = item.creator || {};
          const applicantAvatar = creator.avatarSmall || creator.avatarMiddle || creator.avatar || creator.userHead;
          const actions = getVersionActions({
            from: VERSION_DETAIL_FROM.ORGANIZATION_MANAGEMENT,
            status: item.status,
            scene: VERSION_ACTION_SCENE.LIST,
          });

          return (
            <SandboxListRow key={item.versionId} $columns={REVIEW_LIST_COLUMNS}>
              <SandboxListCheckboxCell>
                <Checkbox
                  checked={selectedIdSet.has(item.versionId)}
                  disabled={!selectable}
                  onChange={event => onSelect([item], event.target.checked)}
                />
              </SandboxListCheckboxCell>
              <AppInfo {...app} appId={item.appId} appName={appName} isDeleted={!appName} />
              <VersionStatus status={item.status} remark={item.remark} />
              <div>{item.versionNo ? formatVersion(item.versionNo) : '—'}</div>
              <Description title={item.description || ''}>{item.description || '—'}</Description>
              <div>{item.createTime || '—'}</div>
              <Applicant>
                {creator.accountId ? (
                  <>
                    <UserHead size={28} user={{ ...creator, userHead: applicantAvatar }} />
                    <span className="applicantName">{creator.fullname || '—'}</span>
                  </>
                ) : (
                  '—'
                )}
              </Applicant>
              <Actions>
                <VersionActionButton onClick={() => onView(item)}>{_l('查看')}</VersionActionButton>
                {actions.map(action => (
                  <VersionActionButton
                    key={action}
                    action={action}
                    disabled={action === VERSION_ACTION.UPGRADE && item.upgrading}
                    onClick={() => onAction({ action, version: item })}
                  >
                    {action === VERSION_ACTION.UPGRADE && item.upgrading ? _l('升级中') : getVersionActionLabel(action)}
                  </VersionActionButton>
                ))}
              </Actions>
            </SandboxListRow>
          );
        })
      ) : (
        <TableEmpty className="w100 h100 pTop0" detail={EMPTY_DETAIL} />
      )}
    </SandboxList>
  );
}

VersionList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  total: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  order: PropTypes.oneOf(Object.values(SANDBOX_LIST_ORDER)).isRequired,
  pageIndex: PropTypes.number.isRequired,
  selectedIdSet: PropTypes.instanceOf(Set).isRequired,
  selectionStatus: PropTypes.oneOf(Object.values(VERSION_STATUS)),
  onSelect: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
};
