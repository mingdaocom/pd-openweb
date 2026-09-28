import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { CHANGE_STATUS } from '../constants';
import useSnapshotContrastDetail from '../hooks/useSnapshotContrastDetail';
import useWorksheetContrastDetail from '../hooks/useWorksheetContrastDetail';
import { getChangeDetailSections } from '../model/changeDetail';
import { getChangeNavigationResources } from '../model/changeNavigation';
import { getChatBotBasicInfoRows } from '../model/chatBotContrast';
import { getPageBasicInfoRows } from '../model/pageContrast';
import { getWorksheetBasicInfoRows } from '../model/worksheetContrast';
import ChangeContentList from './ChangeContentList';
import ChangeResourceNavigation, { getResourceKey } from './ChangeResourceNavigation';
import ChangeStatus from './ChangeStatus';

// 只有服务端提供专用明细接口的资源才下钻；用户与角色、对话机器人直接使用 GetPublishContrast 外层数据。
const DETAIL_REQUEST_GROUP_KEYS = ['worksheets', 'pages', 'workflows'];
const CONTRAST_OPTIONS = { reverse: !isSandboxEnvironment() };

const Panel = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  height: 560px;
  overflow: hidden;
  border: 1px solid var(--color-border-secondary);
  border-radius: 6px;
  background-color: var(--color-background-primary);
`;

const Detail = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 0 20px;
  overflow: hidden;
  box-sizing: border-box;
  flex-direction: column;
`;

const DetailTitle = styled.div`
  display: flex;
  height: 62px;
  align-items: center;
  border-bottom: 1px solid var(--color-border-secondary);
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
`;

const DetailBody = styled.div`
  display: grid;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  grid-template-columns: ${({ $singleSection }) => ($singleSection ? 'minmax(0, 1fr)' : '130px minmax(0, 1fr)')};
  min-height: 0;
  overflow: hidden;
  flex: 1;
`;

const SectionNavigation = styled.div`
  min-height: 0;
  padding: 14px 0;
  overflow-y: auto;
  border-right: 1px solid var(--color-border-secondary);
`;

const SectionItem = styled.button`
  display: block;
  width: 100%;
  height: 38px;
  padding: 0 16px;
  border: 0;
  box-sizing: border-box;
  background-color: transparent;
  background-image: ${({ $active }) =>
    $active ? 'linear-gradient(var(--color-primary), var(--color-primary))' : 'none'};
  background-position: right center;
  background-repeat: no-repeat;
  background-size: 2px 28px;
  color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-primary)')};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: var(--color-background-hover);
    color: var(--color-primary);
  }
`;

const TableWrap = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
  padding: 14px 0 0 20px;
  overflow: hidden;
  box-sizing: border-box;
  flex-direction: column;
`;

const DetailGrid = styled.div`
  display: grid;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 0.7fr) minmax(0, 1.5fr);
  column-gap: 20px;

  > * {
    min-width: 0;
  }
`;

const GridHeader = styled(DetailGrid)`
  position: sticky;
  top: 0;
  z-index: 1;
  min-height: 36px;
  align-items: center;
  border-bottom: 1px solid var(--color-border-secondary);
  background-color: var(--color-background-primary);
  color: var(--color-text-secondary);
  font-size: 12px;
  flex-shrink: 0;
`;

const RowsScroll = styled.div`
  min-height: 0;
  padding-right: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  flex: 1;
`;

const GridRow = styled(DetailGrid)`
  min-height: 48px;
  padding: 8px 0;
  align-items: center;
  border-bottom: 1px solid var(--color-border-secondary);
  box-sizing: border-box;
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 20px;

  .changeName {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .contentLine {
    overflow-wrap: anywhere;
  }

  .contentLine + .contentLine {
    margin-top: 4px;
  }
`;

const Empty = styled.div`
  padding: 60px 20px;
  color: var(--color-text-tertiary);
  font-size: 13px;
  text-align: center;
`;

export default function ChangeDetailPanel({ appId, contrastId, groups }) {
  const resources = groups.flatMap(group =>
    getChangeNavigationResources(group).map(change => ({
      ...change,
      groupKey: group.key,
      resourceKey: getResourceKey(group.key, change),
    })),
  );
  const selectableResources = resources.filter(
    item => item.navigationCategory || item.action === CHANGE_STATUS.UPDATED,
  );
  const initialResource = selectableResources[0];
  const [selectedResourceKey, setSelectedResourceKey] = useState(initialResource?.resourceKey);
  const [detailRequestResourceKey, setDetailRequestResourceKey] = useState(() =>
    DETAIL_REQUEST_GROUP_KEYS.includes(initialResource?.groupKey) ? initialResource.resourceKey : undefined,
  );
  const selectedResource =
    selectableResources.find(item => item.resourceKey === selectedResourceKey) || selectableResources[0];
  const isWorksheetSelected = selectedResource?.groupKey === 'worksheets';
  const isPageSelected = selectedResource?.groupKey === 'pages';
  const isWorkflowSelected = selectedResource?.groupKey === 'workflows';
  const isChatBotSelected = selectedResource?.groupKey === 'chatBots';
  const shouldLoadWorksheetDetail = isWorksheetSelected && selectedResource.resourceKey === detailRequestResourceKey;
  const shouldLoadPageDetail = isPageSelected && selectedResource.resourceKey === detailRequestResourceKey;
  const shouldLoadProcessDetail = isWorkflowSelected && selectedResource.resourceKey === detailRequestResourceKey;
  const worksheetDetail = useWorksheetContrastDetail({
    appId,
    contrastId,
    worksheetId: shouldLoadWorksheetDetail ? selectedResource.sourceId : undefined,
    enabled: shouldLoadWorksheetDetail,
  });
  const pageDetail = useSnapshotContrastDetail({
    type: 'page',
    appId,
    contrastId,
    resourceId: shouldLoadPageDetail ? selectedResource.id : undefined,
    enabled: shouldLoadPageDetail,
  });
  const processDetail = useSnapshotContrastDetail({
    type: 'process',
    appId,
    contrastId,
    resourceId: shouldLoadProcessDetail ? selectedResource.id : undefined,
    enabled: shouldLoadProcessDetail,
  });
  const worksheetChanges = worksheetDetail.data
    ? {
        ...worksheetDetail.data,
        basicInfo: [
          ...getWorksheetBasicInfoRows(selectedResource, CONTRAST_OPTIONS),
          ...(worksheetDetail.data.basicInfo || []),
        ],
      }
    : null;
  const pageChanges = pageDetail.data
    ? {
        ...pageDetail.data,
        basicInfo: [...getPageBasicInfoRows(selectedResource, CONTRAST_OPTIONS), ...(pageDetail.data.basicInfo || [])],
      }
    : null;
  const chatBotChanges = isChatBotSelected
    ? { basicConfig: getChatBotBasicInfoRows(selectedResource, CONTRAST_OPTIONS) }
    : null;
  const detailResource =
    shouldLoadWorksheetDetail && worksheetChanges
      ? { ...selectedResource, changes: worksheetChanges }
      : shouldLoadPageDetail && pageChanges
        ? { ...selectedResource, changes: pageChanges }
        : shouldLoadProcessDetail && processDetail.data
          ? { ...selectedResource, changes: processDetail.data }
          : chatBotChanges
            ? { ...selectedResource, changes: chatBotChanges }
            : selectedResource;
  const sections = getChangeDetailSections(detailResource);
  const [selectedSectionKey, setSelectedSectionKey] = useState(sections[0]?.key);
  const selectedSection = sections.find(section => section.key === selectedSectionKey) || sections[0];

  const selectResource = resourceKey => {
    const resource = selectableResources.find(item => item.resourceKey === resourceKey);

    setSelectedResourceKey(resourceKey);
    setSelectedSectionKey(undefined);
    setDetailRequestResourceKey(DETAIL_REQUEST_GROUP_KEYS.includes(resource?.groupKey) ? resourceKey : undefined);
  };

  const detailLoading =
    (shouldLoadWorksheetDetail && worksheetDetail.loading) ||
    (shouldLoadPageDetail && pageDetail.loading) ||
    (shouldLoadProcessDetail && processDetail.loading);
  const detailError =
    (shouldLoadWorksheetDetail && worksheetDetail.error) ||
    (shouldLoadPageDetail && pageDetail.error) ||
    (shouldLoadProcessDetail && processDetail.error);

  return (
    <Panel>
      <ChangeResourceNavigation
        groups={groups}
        selectedResourceKey={selectedResource?.resourceKey}
        onSelect={selectResource}
      />
      {selectedResource && (
        <Detail>
          <DetailTitle>{selectedResource.name}</DetailTitle>
          {detailLoading ? (
            <Empty>
              <LoadDiv />
            </Empty>
          ) : detailError ? (
            <Empty>{detailError.message || _l('获取变更详情失败，请稍后重试')}</Empty>
          ) : sections.length ? (
            <DetailBody $singleSection={selectedResource.navigationCategory}>
              {!selectedResource.navigationCategory && (
                <SectionNavigation>
                  {sections.map(section => (
                    <SectionItem
                      key={section.key}
                      type="button"
                      $active={section.key === selectedSection?.key}
                      onClick={() => setSelectedSectionKey(section.key)}
                    >
                      {section.label}
                    </SectionItem>
                  ))}
                </SectionNavigation>
              )}
              <TableWrap key={`${selectedResource.resourceKey}:${selectedSection?.key || ''}`}>
                <RowsScroll>
                  <GridHeader>
                    <span>{_l('变更项')}</span>
                    <span>{_l('类型')}</span>
                    <span>{_l('变更内容')}</span>
                  </GridHeader>
                  {selectedSection?.rows.map(row => {
                    return (
                      <GridRow key={row.id}>
                        <span className="changeName" title={row.name}>
                          {row.name}
                        </span>
                        <ChangeStatus status={row.action} />
                        <ChangeContentList items={row.content} keyPrefix={row.id} />
                      </GridRow>
                    );
                  })}
                </RowsScroll>
              </TableWrap>
            </DetailBody>
          ) : (
            <Empty>{_l('暂无更新内容')}</Empty>
          )}
        </Detail>
      )}
    </Panel>
  );
}

ChangeDetailPanel.propTypes = {
  appId: PropTypes.string.isRequired,
  contrastId: PropTypes.string.isRequired,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      changes: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          sourceId: PropTypes.string,
          name: PropTypes.string.isRequired,
          action: PropTypes.oneOf(Object.values(CHANGE_STATUS)).isRequired,
        }),
      ).isRequired,
    }),
  ).isRequired,
};
