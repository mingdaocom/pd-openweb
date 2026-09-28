import React from 'react';
import cx from 'classnames';
import _, { get, isEmpty } from 'lodash';
import { bool, element, func, shape } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Tooltip } from 'ming-ui/antd-components';
import SheetHeader from 'worksheet/common/Sheet/SheetHeader';
import Pagination from 'worksheet/components/Pagination';
import SearchInput from 'worksheet/components/SearchInput';
import SearchRecord from 'worksheet/views/components/SearchRecord';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import { renderText as renderCellText } from 'src/utils/domain/control/display';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { getGroupControlId } from 'src/utils/domain/worksheet/helpers';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { isPublicLink } from 'src/utils/platform/runtime/shareState';

const Con = styled.div`
  display: flex;
  padding: 6px 0;
  align-items: center;
  .sheetHeader {
    padding-right: 0;
    .batchOperateCon,
    .headerLeft,
    .staticsEntry,
    .discussionEntry,
    .addRecordEntry {
      display: none;
    }
  }
  &.hideSearchRecord {
    .worksheetQueryInput {
      display: none;
    }
  }
  &.hideFilter {
    .filterEntry {
      display: none;
    }
  }
  &.hideImport {
    .importEntry {
      display: none;
    }
  }
  &.hideDraft {
    .draftEntry {
      display: none;
    }
  }
`;

const Flex = styled.div`
  flex: 1;
`;

const EmbedAddRecord = styled.div`
  cursor: pointer;
  i {
    color: var(--color-text-secondary);
  }
  &:hover {
    color: var(--color-primary);
    i {
      color: var(--color-primary);
    }
  }
`;

const isMobile = browserIsMobile();

export default function Header(props) {
  const { headerLeft, headerRight } = props;
  const {
    maxCount,
    forcePageSize,
    worksheetInfo,
    view,
    searchData,
    sheetViewData,
    showAsSheetView,
    sheetFetchParams,
    sheetSwitchPermit,
    fromEmbed = false,
    isDraft,
    isAddRecord = true,
    searchRecord = true,
    allowFilter = false,
    allowDraft = false,
    allowImport = false,
  } = props;
  const { changePageSize, changePageIndex, updateFiltersWithView, updateSearchRecord, refreshSheet, openNewRecord } =
    props;
  const { count } = sheetViewData;
  const { pageIndex, pageSize } = sheetFetchParams;
  const { entityName, allowAdd } = worksheetInfo;
  const viewType = String(view.viewType);

  const handleSearchData = () => {
    if (!searchData) return;

    const controls = _.get(worksheetInfo, 'template.controls') || [];
    const titleField = controls.find(m => m.controlId === searchData.queryKey);
    const searchRecordData = searchData.data.map(l => {
      return {
        ...l,
        [searchData.queryKey]: renderCellText({
          ...titleField,
          value: searchData.queryKey ? l[searchData.queryKey] : undefined,
        }),
      };
    });

    return searchRecordData;
  };

  if (isMobile) {
    return (
      <Con className="SingleViewHeader mobile">
        {headerLeft}
        <Flex />
        {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && (
          <Icon
            icon="plus"
            className="addRecord Font20 textTertiary"
            onClick={() => {
              const { appId, worksheetId } = worksheetInfo;
              const { viewId } = view;
              window.mobileNavigateTo && window.mobileNavigateTo(`/mobile/addRecord/${appId}/${worksheetId}/${viewId}`);
            }}
          />
        )}
        {window.shareState.isPublicView && (
          <PublicAppLangDropdown className="mRight6" appId={worksheetInfo.appId} projectId={worksheetInfo.projectId} />
        )}
        {headerRight}
      </Con>
    );
  }

  return (
    <Con
      className={cx('SingleViewHeader', {
        Border0: !_.isEmpty(view.fastFilters),
        hideSearchRecord: !searchRecord,
        hideFilter: window.shareState.shareId ? true : !allowFilter,
        hideImport: window.shareState.shareId ? true : !allowImport,
        hideDraft: window.shareState.shareId ? true : !allowDraft,
      })}
    >
      {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
        isAddRecord &&
        allowAdd &&
        fromEmbed &&
        !_.isEmpty(view) &&
        !isPublicLink() && (
          <EmbedAddRecord className="addRecord flexCenter Block" onClick={() => openNewRecord({ isDraft })}>
            <Icon icon="plus" className="Font14 mRight2" />
            <span className="Bold Font14">{_.get(worksheetInfo, 'advancedSetting.btnname') || entityName}</span>
          </EmbedAddRecord>
        )}
      {headerLeft}

      <Flex />

      {window.shareState.isPublicView && (
        <PublicAppLangDropdown className="mRight10" appId={worksheetInfo.appId} projectId={worksheetInfo.projectId} />
      )}

      {/** 其他头部操作走SheetHeader，搜索保存不变 */}
      {searchRecord &&
        ([VIEW_DISPLAY_TYPE.structure, VIEW_DISPLAY_TYPE.gunter, VIEW_DISPLAY_TYPE.map].includes(viewType) &&
        get(view, 'advancedSetting.hierarchyViewType') !== '3' &&
        !showAsSheetView ? (
          <SearchRecord
            queryKey={searchData.queryKey}
            data={handleSearchData()}
            onSearch={record => {
              updateSearchRecord(view, record);
            }}
            onClose={() => {
              updateSearchRecord(view, null);
            }}
          >
            <Tooltip placement="bottom" title={_l('查找')}>
              <Icon icon="search" className="textTertiary Font22 pointer hoverColorPrimary mTop2" />
            </Tooltip>
          </SearchRecord>
        ) : (
          <SearchInput
            className="queryInput"
            onOk={value => {
              updateFiltersWithView({ keyWords: (value || '').trim() });
            }}
            onClear={() => {
              updateFiltersWithView({ keyWords: '' });
            }}
          />
        ))}
      {!isEmpty(worksheetInfo) && !fromEmbed && <SheetHeader isSingleView={true} {...props} />}

      <Tooltip placement="bottom" title={_l('刷新')}>
        <Icon
          icon="task-later"
          className="textTertiary Font20 pointer mLeft2 mRight2"
          onClick={() => {
            refreshSheet(view, { isRefreshBtn: true });
          }}
        />
      </Tooltip>
      {(showAsSheetView || viewType === VIEW_DISPLAY_TYPE.sheet) && (
        <Pagination
          allowChangePageSize={!forcePageSize}
          onlyShowCount={!showAsSheetView && getGroupControlId(view)}
          className="pagination"
          pageIndex={pageIndex}
          pageSize={forcePageSize || pageSize}
          allCount={count}
          maxCount={maxCount}
          changePageSize={changePageSize}
          changePageIndex={changePageIndex}
          onPrev={() => {
            changePageIndex(pageIndex - 1);
          }}
          onNext={() => {
            changePageIndex(pageIndex + 1);
          }}
        />
      )}
      {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && isAddRecord && allowAdd && !fromEmbed && (
        <Button
          style={{ '--hap-control-height': '32px' }}
          color="var(--app-primary-color)"
          shape="round"
          className="mLeft15 addRecord"
          icon={<Icon icon="plus" className="mRight2" />}
          onClick={openNewRecord}
        >
          {_.get(worksheetInfo, 'advancedSetting.btnname') || entityName}
        </Button>
      )}
      {headerRight}
    </Con>
  );
}

Header.propTypes = {
  headerLeft: element,
  headerRight: element,
  sheetViewData: shape({}),
  showAsSheetView: bool,
  sheetFetchParams: shape({}),
  changePageSize: func,
  changePageIndex: func,
  updateFiltersWithView: func,
  updateSearchRecord: func,
  refreshSheet: func,
  openNewRecord: func,
};
