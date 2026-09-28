import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, UserHead } from 'ming-ui';
import { Button, Checkbox } from 'ming-ui/antd-components';
import TableEmpty from 'src/pages/Admin/common/TableEmpty';
import SelectApp from 'src/pages/Admin/components/SelectApp';
import SelectUser from 'src/pages/Admin/components/SelectUser';
import { SANDBOX_LIST_ORDER } from 'src/utils/domain/app/sandbox';
import { openPeerEnvironment } from 'src/utils/domain/app/sandbox';
import SandboxList, {
  AppInfo,
  SANDBOX_LIST_ACTION_COLUMN_WIDTH,
  SANDBOX_LIST_CHECKBOX_COLUMN_WIDTH,
  SandboxListCheckboxCell,
  SandboxListRow,
  SandboxListSortHeader,
  useSandboxListSelection,
} from '../../components/SandboxList';
import { SandboxPageContent } from '../../components/SandboxPageLayout';
import { PAGE_SIZE, REVIEW_RULE_LABEL, SANDBOX_NOTICE_LINES } from '../constants';
import { useSandboxApps } from '../hooks/useSandboxAdmin';

const HeaderActionButton = styled(Button)`
  font-weight: 500;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Notice = styled.ol`
  padding: 10px 30px;
  border-radius: 3px;
  background-color: var(--color-info-bg);
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 22px;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  height: 36px;

  .appSelect,
  .ownerSelect {
    width: 180px;
  }

  .sandboxActionButton {
    padding: 0 32px;
    border-radius: 32px;
    font-weight: 600;
  }
`;

const RowAction = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ disabled }) => (disabled ? 'var(--color-text-disabled)' : 'var(--color-primary)')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font: inherit;
  white-space: nowrap;

  &:hover {
    color: ${({ disabled }) => (disabled ? 'var(--color-text-disabled)' : 'var(--color-primary-dark)')};
  }
`;

const OwnerInfo = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;

  .ownerName {
    margin-left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const APP_LIST_COLUMNS = `${SANDBOX_LIST_CHECKBOX_COLUMN_WIDTH} minmax(260px, 1.5fr) minmax(160px, 0.8fr) minmax(180px, 0.8fr) minmax(180px, 0.8fr) ${SANDBOX_LIST_ACTION_COLUMN_WIDTH}`;
const EMPTY_APP_DETAIL = { icon: 'icon-worksheet_public', desc: _l('暂无数据') };

export default function SandboxAppList({
  projectId,
  refreshKey,
  openSandboxDisabled,
  batchEnabling,
  batchDisabling,
  onCloseSandbox,
  onOpenSandbox,
}) {
  const [appId, setAppId] = useState('');
  const [owners, setOwners] = useState([]);
  const [order, setOrder] = useState(SANDBOX_LIST_ORDER.DESC);
  const [pageIndex, setPageIndex] = useState(1);
  const { selectedIds: selectedAppIds, updateSelection, clearSelection } = useSandboxListSelection();
  const selectedAppIdSet = useMemo(() => new Set(selectedAppIds), [selectedAppIds]);
  const appIds = useMemo(() => (appId ? [appId] : []), [appId]);
  const createAccountIds = useMemo(() => owners.map(owner => owner.accountId), [owners]);
  const { apps, total, loading } = useSandboxApps({
    projectId,
    appIds,
    createAccountIds,
    order,
    pageIndex,
    pageSize: PAGE_SIZE,
    refreshKey,
  });
  const currentPageIds = useMemo(() => apps.map(app => app.appId), [apps]);
  const selectedCurrentPageCount = currentPageIds.filter(id => selectedAppIdSet.has(id)).length;
  const currentPageSelected = Boolean(currentPageIds.length) && selectedCurrentPageCount === currentPageIds.length;

  const resetFilter = () => {
    clearSelection();
    setPageIndex(1);
  };

  return (
    <>
      <div className="orgManagementHeader">
        <div className="tabBox">{_l('应用沙盒')}</div>
        <HeaderActions>
          <HeaderActionButton icon={<Icon icon="launch" />} onClick={() => openPeerEnvironment('/dashboard')}>
            {_l('访问沙盒环境')}
          </HeaderActionButton>
        </HeaderActions>
      </div>
      <SandboxPageContent>
        <Notice>
          {SANDBOX_NOTICE_LINES.map(line => (
            <li key={line}>{line}</li>
          ))}
        </Notice>
        <Toolbar>
          <SelectApp
            className="appSelect"
            projectId={projectId}
            value={appId}
            onChange={value => {
              setAppId(value);
              resetFilter();
            }}
          />
          <SelectUser
            className="ownerSelect"
            projectId={projectId}
            userInfo={owners}
            placeholder={_l('搜索拥有者')}
            isAdmin
            changeData={nextOwners => {
              setOwners(nextOwners);
              resetFilter();
            }}
          />
          <div className="flex" />
          {selectedAppIds.length ? (
            <Button
              className="sandboxActionButton"
              type="primary"
              loading={batchDisabling}
              disabled={batchDisabling}
              onClick={() => onCloseSandbox(selectedAppIds, clearSelection)}
            >
              {_l('关闭沙盒')}
            </Button>
          ) : (
            <Button
              className="sandboxActionButton"
              type="primary"
              loading={batchEnabling}
              disabled={openSandboxDisabled}
              onClick={onOpenSandbox}
            >
              {_l('开启沙盒')}
            </Button>
          )}
        </Toolbar>
        <SandboxList
          columns={APP_LIST_COLUMNS}
          header={
            <>
              <SandboxListCheckboxCell>
                <Checkbox
                  checked={currentPageSelected}
                  indeterminate={selectedCurrentPageCount > 0 && !currentPageSelected}
                  disabled={loading || !currentPageIds.length}
                  onChange={event => updateSelection(currentPageIds, event.target.checked)}
                />
              </SandboxListCheckboxCell>
              <div>{_l('应用名称')}</div>
              <div>{_l('审核规则')}</div>
              <SandboxListSortHeader
                $disabled={loading || !apps.length}
                onClick={
                  loading || !apps.length
                    ? undefined
                    : () => {
                        // 排序会改变跨页数据顺序，清空已有选择，避免批量操作命中用户当前不可见的旧顺序数据。
                        clearSelection();
                        setOrder(order === SANDBOX_LIST_ORDER.DESC ? SANDBOX_LIST_ORDER.ASC : SANDBOX_LIST_ORDER.DESC);
                        setPageIndex(1);
                      }
                }
              >
                {_l('最近升级时间')}
                <span className="sortIcons">
                  <Icon icon="arrow-up" className={order === SANDBOX_LIST_ORDER.ASC ? 'colorPrimary' : ''} />
                  <Icon icon="arrow-down" className={order === SANDBOX_LIST_ORDER.DESC ? 'colorPrimary' : ''} />
                </span>
              </SandboxListSortHeader>
              <div>{_l('拥有者')}</div>
              <div />
            </>
          }
          total={total}
          pageIndex={pageIndex}
          pageSize={PAGE_SIZE}
          onPageChange={setPageIndex}
        >
          {loading ? (
            <LoadDiv className="mTop30" />
          ) : !apps.length ? (
            <TableEmpty className="h100 pTop0" detail={EMPTY_APP_DETAIL} />
          ) : (
            apps.map(app => (
              <SandboxListRow key={app.appId} $columns={APP_LIST_COLUMNS}>
                <SandboxListCheckboxCell>
                  <Checkbox
                    checked={selectedAppIdSet.has(app.appId)}
                    onChange={event => updateSelection([app.appId], event.target.checked)}
                  />
                </SandboxListCheckboxCell>
                <AppInfo {...app} />
                <div>{REVIEW_RULE_LABEL[app.reviewMode]}</div>
                <div>{app.updateTime}</div>
                <OwnerInfo>
                  {/* 企业小秘书没有普通成员 accountId，仍需交给 UserHead 渲染其头像和悬浮名片。 */}
                  <UserHead
                    size={28}
                    projectId={projectId}
                    user={{ accountId: app.owner.accountId, userHead: app.owner.avatar }}
                  />
                  <span className="ownerName">{app.owner.fullName}</span>
                </OwnerInfo>
                <RowAction
                  disabled={batchDisabling}
                  onClick={() => onCloseSandbox([app.appId], () => updateSelection([app.appId], false))}
                >
                  {_l('关闭沙盒')}
                </RowAction>
              </SandboxListRow>
            ))
          )}
        </SandboxList>
      </SandboxPageContent>
    </>
  );
}

SandboxAppList.propTypes = {
  batchDisabling: PropTypes.bool,
  batchEnabling: PropTypes.bool,
  openSandboxDisabled: PropTypes.bool,
  projectId: PropTypes.string,
  refreshKey: PropTypes.number,
  onCloseSandbox: PropTypes.func.isRequired,
  onOpenSandbox: PropTypes.func.isRequired,
};
