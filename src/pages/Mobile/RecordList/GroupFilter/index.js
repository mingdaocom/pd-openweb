import React, { useState, Fragment, useEffect } from 'react';
import { Icon } from 'ming-ui';
import { Popup } from 'antd-mobile';
import { RecordInfoModal } from 'mobile/Record';
import { openAddRecord } from 'mobile/Record/addRecord';
import SheetView from '../View/SheetView';
import GalleryView from '../View/GalleryView';
import MobileMapView from '../View/MapView';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { AddRecordBtn, BatchOperationBtn } from 'mobile/components/RecordActions';
import { getViewActionInfo } from 'src/pages/Mobile/RecordList/util';
import GroupFilterList from './GroupFilterList';
import QuickFilterSearch from 'mobile/RecordList/QuickFilter/QuickFilterSearch';
import { handlePushState, handleReplaceState } from 'src/util';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const { sheet, gallery, map } = VIEW_DISPLAY_TYPE;
const TYPE_TO_COMP = {
  [sheet]: SheetView,
  [gallery]: GalleryView,
  [map]: MobileMapView,
};

const GroupFilter = props => {
  const {
    views = [],
    base = {},
    controls = [],
    isCharge,
    sheetSwitchPermit,
    batchOptVisible,
    worksheetInfo,
    appColor,
    mobileNavGroupFilters,
    detail,
    filters,
    quickFilter,
    quickFilterWithDefault,
    savedFilters,
    activeSavedFilter,
    updateFilters = () => {},
    updateActiveSavedFilter = () => {},
  } = props;
  const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
  const isFilter = quickFilter.length;
  const { appId, viewId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const { advancedSetting = {} } = view;
  const { appnavtype, usenav } = advancedSetting;
  const [previewRecordId, setPreviewRecordId] = useState();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({});
  const Component = TYPE_TO_COMP[String(view.viewType)];
  const viewProps = {
    ...base,
    isCharge,
    view,
    controls,
    sheetSwitchPermit,
  };
  const { canAddRecord, showBatchBtn, recordActionWrapBottom } = getViewActionInfo({
    view,
    viewId: base.viewId,
    worksheetInfo,
    sheetSwitchPermit,
    batchOptVisible,
    isGroupFilter: true,
  });
  const handleOpenDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const getDefaultValueInCreate = () => {
    if (_.isEmpty(mobileNavGroupFilters)) return;
    let data = mobileNavGroupFilters[0];
    if ([9, 10, 11, 28].includes(data.dataType)) {
      return { [data.controlId]: JSON.stringify([data.values[0]]) };
    } else if ([26, 27, 48].includes(data.dataType)) {
      let value = '';
      const id = _.get(data, 'values[0]');
      const name = _.get(data, 'navNames[0]');
      if (id && name) {
        value = JSON.stringify([safeParse(name)]);
      } else {
        value = '[]';
      }
      return { [data.controlId]: value };
    } else if ([29, 35]) {
      return {
        [data.controlId]: JSON.stringify([
          {
            sid: data.values[0],
            name: data.navNames[0] || '',
          },
        ]),
      };
    }
  };

  const onQueryChange = () => {
    handleReplaceState('page', 'groupFilter', () => setDrawerVisible(false));
  };

  useEffect(() => {
    if (appnavtype !== '1') return;
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);

  return (
    <Fragment>
      <GroupFilterList
        {...props}
        handleClickItem={item => {
          if (appnavtype === '1') {
            handlePushState('page', 'groupFilter');
          }
          setDrawerVisible(true);
          setCurrentGroup(item);
        }}
      />
      <RecordInfoModal
        className="full"
        visible={!!previewRecordId}
        enablePayment={worksheetInfo.enablePayment}
        appId={base.appId}
        worksheetId={base.worksheetId}
        viewId={base.viewId}
        rowId={previewRecordId}
        onClose={() => {
          setPreviewRecordId(undefined);
        }}
      />
      {drawerVisible && (
        <Popup className={cx('groupFilterDrawer')} position="right" visible={drawerVisible} onClose={handleOpenDrawer}>
          <div className="groupDetailBox">
            {!batchOptVisible && (
              <div
                className="groupTitle valignWrapper"
                onClick={() => {
                  setDrawerVisible(false);
                }}
              >
                <Icon icon="arrow-left-border" className="mRight2 Gray_75 TxtMiddle" />
                <span className="Font15 flex ellipsis">{currentGroup.txt}</span>
              </div>
            )}
            {view.viewType === 0 && appnavtype === '1' && (
              <QuickFilterSearch
                isFilter={isFilter}
                filters={filters}
                detail={detail}
                view={view}
                worksheetInfo={worksheetInfo}
                sheetControls={sheetControls}
                updateFilters={updateFilters}
                quickFilterWithDefault={quickFilterWithDefault}
                savedFilters={savedFilters}
                activeSavedFilter={activeSavedFilter}
                updateActiveSavedFilter={updateActiveSavedFilter}
                base={base}
              />
            )}
            <div className="groupDetailCon flexColumn overflowHidden">
              <Component {...viewProps} changeActionSheetModalIndex={true} />

              <div
                className="recordActionWrap"
                style={{
                  position: 'fixed',
                  right: 20,
                  bottom: recordActionWrapBottom,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {showBatchBtn && (
                  <BatchOperationBtn className="Static mTop10" onClick={() => props.changeBatchOptVisible(true)} />
                )}

                {canAddRecord && (
                  <AddRecordBtn
                    entityName={worksheetInfo.entityName}
                    backgroundColor={appColor}
                    className="Static mTop10"
                    onClick={() => {
                      let defaultFormData = getDefaultValueInCreate();
                      let param =
                        usenav === '1'
                          ? {
                              defaultFormData,
                              defaultFormDataEditable: true,
                            }
                          : {};
                      openAddRecord({
                        ...param,
                        className: 'full',
                        worksheetInfo,
                        appId,
                        worksheetId: worksheetInfo.worksheetId,
                        viewId: view.viewId,
                        addType: 2,
                        entityName: worksheetInfo.entityName,
                        onAdd: data => {
                          if (view.viewType) {
                            props.addNewRecord(data, view);
                          } else {
                            props.unshiftSheetRow(data);
                          }
                        },
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </Popup>
      )}
    </Fragment>
  );
};

export default GroupFilter;
