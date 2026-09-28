import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, ScrollView, SvgIcon } from 'ming-ui';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import { navigateTo } from 'src/router/navigation/navigateTo';

export const SANDBOX_LIST_CHECKBOX_COLUMN_WIDTH = '36px';
export const SANDBOX_LIST_ACTION_COLUMN_WIDTH = '110px';

const List = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  align-items: center;
`;

const ListHeader = styled(Grid)`
  padding: 12px;
  margin: 24px 0 16px;
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-secondary);
  font-weight: bold;
  flex-shrink: 0;

  &:hover {
    background: var(--color-background-primary);
  }
`;

const ListBodyWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin: 0 -24px;
`;

const ListBody = styled(ScrollView)`
  width: 100%;
  height: 100%;
`;

export const SandboxListRow = styled(Grid)`
  padding: 0 10px;
  margin: 0 24px;
  min-height: 60px;
  border-bottom: 1px solid var(--color-border-secondary);
  color: var(--color-text-title);
  font-size: 14px;

  &:hover {
    background-color: var(--color-background-hover);
  }
`;

const AppInfoWrap = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;

  .appIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 5px;
    color: var(--color-white);
    flex-shrink: 0;

    .Icon {
      font-size: 24px;
    }
  }
`;

const AppName = styled.span`
  margin-left: 10px;
  overflow: hidden;
  color: ${({ $clickable }) => ($clickable ? 'var(--color-text-primary)' : 'var(--color-text-disabled)')};
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:hover {
    color: ${({ $clickable }) => ($clickable ? 'var(--color-primary)' : 'var(--color-text-disabled)')};
  }
`;

export function AppInfo({
  appId = '',
  appName = '',
  iconUrl = '',
  icon = 'application',
  iconColor,
  isDeleted = false,
}) {
  const displayName = appName || _l('应用已删除');
  const clickable = Boolean(appId && appName && !isDeleted);

  return (
    <AppInfoWrap>
      <span className="appIcon" style={{ backgroundColor: iconColor || 'var(--color-primary)' }}>
        {iconUrl ? <SvgIcon url={iconUrl} fill="var(--color-white)" size={24} /> : <Icon icon={icon} />}
      </span>
      <AppName
        $clickable={clickable}
        title={displayName}
        onClick={clickable ? () => navigateTo(`/app/${appId}`) : undefined}
      >
        {displayName}
      </AppName>
    </AppInfoWrap>
  );
}

AppInfo.propTypes = {
  appId: PropTypes.string,
  appName: PropTypes.string,
  iconUrl: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  isDeleted: PropTypes.bool,
};

export const SandboxListCheckboxCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const SandboxListSortHeader = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};

  .sortIcons {
    display: flex;
    margin-left: 4px;
    flex-direction: column;
    color: var(--color-text-disabled);
    transform: scale(0.8);
  }

  .Icon {
    height: 8px;
    font-size: 10px;
    line-height: 8px;
  }
`;

const Pagination = styled(PaginationWrap)`
  min-height: 60px;
  flex-shrink: 0;
`;

export const useSandboxListSelection = () => {
  const [selectedIds, setSelectedIds] = useState([]);

  const updateSelection = useCallback((ids, checked) => {
    setSelectedIds(currentIds => {
      const nextIds = new Set(currentIds);

      ids.forEach(id => (checked ? nextIds.add(id) : nextIds.delete(id)));
      return [...nextIds];
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  return { selectedIds, updateSelection, clearSelection };
};

export default function SandboxList({ columns, header, children, total, pageIndex, pageSize, onPageChange }) {
  return (
    <List>
      <ListHeader $columns={columns}>{header}</ListHeader>
      <ListBodyWrapper>
        <ListBody>{children}</ListBody>
      </ListBodyWrapper>
      {total > pageSize && (
        <Pagination total={total} pageIndex={pageIndex} pageSize={pageSize} onChange={onPageChange} />
      )}
    </List>
  );
}

SandboxList.propTypes = {
  columns: PropTypes.string.isRequired,
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  total: PropTypes.number.isRequired,
  pageIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
