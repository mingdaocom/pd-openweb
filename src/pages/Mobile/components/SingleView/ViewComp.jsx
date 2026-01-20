import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import { useDeepCompareEffect } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import homeAppAjax from 'src/api/homeApp';
import { BatchOperationBtn } from 'mobile/components/RecordActions';
import { openAddRecord } from 'mobile/Record/addRecord';
import {
  changeBatchOptVisible,
  loadWorksheet,
  unshiftSheetRow,
  updateFiltersGroup,
} from 'mobile/RecordList/redux/actions';
import View from 'mobile/RecordList/View';
import ShareCardConfig from 'src/components/ShareCardConfig';
import { SHARECARDTYPS } from 'src/components/ShareCardConfig/config';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import SlideGroupFilter from 'src/pages/Mobile/RecordList/GroupFilter/SlideGroupFilter.jsx';
import { addNewRecord, updateFilters } from 'src/pages/worksheet/redux/actions';
import { mdAppResponse } from 'src/utils/project';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ViewCon = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid #e0e0e0 !important;
  .toolBarWrap {
    z-index: 100 !important;
  }
  .batchOptBar {
    justify-content: space-between;
    height: 42px;
    line-height: 42px;
    padding: 0 15px;
    background-color: #fff;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  }
`;

const Header = styled.div`
  height: 44px;
  padding: 0px 24px;
  background-color: rgb(255, 255, 255);
`;

const AddBtn = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  button {
    width: 60px !important;
    height: 60px !important;
    min-width: initial !important;
    display: flex !important;
    justify-content: center;
    align-items: center;
    border-radius: 50% !important;
    padding: 0px 15px !important;
    margin: 0 auto;
    box-shadow: 0 1px 4px #00000029;
  }
`;

function ViewComp(props) {
  const { showHeader, headerLeft, headerRight } = props;
  const {
    base = {},
    batchOptVisible,
    workSheetLoading,
    worksheetInfo,
    sheetSwitchPermit,
    filtersGroup = [],
    showPageTitle,
    config = {},
  } = props;
  const { loadWorksheet, updateFilters, updateFiltersGroup } = props;
  const { views = [], allowAdd } = worksheetInfo;
  const { viewId, appId, worksheetId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const appNavType = _.get(view, 'advancedSetting.appnavtype');
  const [appColor, setAppColor] = useState('');
  const navData = (_.get(worksheetInfo, 'template.controls') || []).find(
    o => o.controlId === _.get(view, 'navGroup[0].controlId'),
  );
  let hasGroupFilter =
    view.viewId === base.viewId &&
    !_.isEmpty(view.navGroup) &&
    view.navGroup.length > 0 &&
    !location.search.includes('chartId') &&
    _.includes(['0'], String(view.viewType)) &&
    navData &&
    (appNavType === '2' || !appNavType || appNavType === '3' || _.includes([29, 35], navData.type)); // 是否存在分组列表
  const canDelete = isOpenPermit(permitList.delete, sheetSwitchPermit, view.viewId);
  const showCusTomBtn = isOpenPermit(permitList.execute, sheetSwitchPermit, view.viewId);
  const canAddRecord =
    !_.isEmpty(view) &&
    isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
    allowAdd &&
    ((view.viewType === 6 && view.childType !== 1) || view.viewType !== 6) &&
    ((view.viewType === 2 && _.get(view, 'advancedSetting.hierarchyViewType') !== '3') || view.viewType !== 2);
  const showBatchBtn =
    view.viewType === 0 &&
    (canDelete || showCusTomBtn) &&
    !batchOptVisible &&
    (_.isEmpty(view.navGroup) || appNavType !== '1') &&
    !_.get(window, 'shareState.isPublicView') &&
    !_.get(window, 'shareState.isPublicPage') &&
    !_.get(window, 'shareState.shareId') &&
    !_.get(window, 'shareState.isPublicForm');

  useEffect(() => {
    if (appId && worksheetId) {
      loadWorksheet(true);
    }
  }, [appId, worksheetId]);

  useEffect(() => {
    if (window.isWeiXin && view?.viewId && worksheetInfo?.worksheetId) {
      ShareCardConfig({
        title: `${worksheetInfo?.name}-${view?.name}`,
        projectId: worksheetInfo?.projectId,
        worksheetId,
        type: SHARECARDTYPS.VIEW,
        viewType: view?.viewType,
      });
    }
  }, [view, worksheetInfo, worksheetId]);

  useEffect(() => {
    getAppInfo();
  }, [appId]);

  useDeepCompareEffect(() => {
    if (!workSheetLoading && viewId) {
      if (_.get(view, 'navGroup.length')) {
        updateFilters({ filtersGroup }, view);
        updateFiltersGroup(filtersGroup, view);
        return;
      }
      if ([0, 1, 3, 4, 6].includes(view.viewType)) {
        updateFiltersGroup(filtersGroup, view);
      } else {
        updateFilters({ filtersGroup }, view);
      }
    }
  }, [filtersGroup, workSheetLoading, viewId]);

  const getAppInfo = () => {
    const isEmbed = /\/embed\/view\//.test(location.pathname);
    if (!appId || _.get(window, 'shareState.shareId') || isEmbed || _.isEmpty(view)) return;
    homeAppAjax.getApp({ appId }).then(data => {
      setAppColor(data.iconColor);
    });
  };

  const addRecord = () => {
    const { appId, worksheetId } = worksheetInfo;
    if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
      window.location.href = `/mobile/addRecord/${appId}/${worksheetId}/${view.viewId}`;
      return;
    }
    const addRecord = data => {
      if (view.viewType) {
        props.addNewRecord(data, view);
      } else {
        props.unshiftSheetRow(data);
      }
    };
    if (window.isMingDaoApp) {
      mdAppResponse({
        type: 'native',
        settings: {
          appId,
          worksheetId,
          viewId: view.viewId,
          action: 'addRow',
        },
      }).then(data => {
        const { value } = data;
        if (value) {
          const res = JSON.parse(value);
          res.forEach(data => {
            addRecord(data);
          });
        }
      });
    } else {
      openAddRecord({
        className: 'full',
        worksheetInfo,
        appId,
        worksheetId,
        viewId: view.viewId,
        addType: 2,
        entityName: worksheetInfo.entityName,
        onAdd: addRecord,
        showDraftsEntry: true,
        sheetSwitchPermit,
        isDraft: config.isDraft,
      });
    }
  };

  return (
    !workSheetLoading && (
      <Con className="SingleViewWrap">
        {showPageTitle && worksheetInfo.name && (
          <DocumentTitle title={`${worksheetInfo.name}${view.name ? ` - ${view.name}` : ''}`} />
        )}
        {showHeader && (
          <Header className="SingleViewHeader mobile flexRow valignWrapper">
            {headerLeft}
            <div className="flex" />
            {headerRight}
          </Header>
        )}
        <Fragment>
          {hasGroupFilter && <SlideGroupFilter {...props} view={view} />}
          <ViewCon className="flexRow SingleViewBody">
            <View view={view} viewFlag={Date.now()} />
          </ViewCon>
        </Fragment>

        <AddBtn>
          {showBatchBtn && (
            <BatchOperationBtn className="Static mTop10" onClick={() => props.changeBatchOptVisible(true)} />
          )}
          {!batchOptVisible && canAddRecord && (
            <Button
              radius
              className={cx('valignWrapper flexRow addRecord mTop10', {
                'Right mRight16': [2, 5, 7].includes(view.viewType),
              })}
              style={{ backgroundColor: appColor }}
              onClick={addRecord}
            >
              <Icon icon="add" className="Font36" />
            </Button>
          )}
        </AddBtn>
      </Con>
    )
  );
}

export default connect(
  state => ({
    ..._.pick(
      state.mobile,
      'base',
      'workSheetLoading',
      'worksheetInfo',
      'sheetSwitchPermit',
      'appColor',
      'batchOptVisible',
    ),
  }),
  dispatch =>
    bindActionCreators(
      {
        loadWorksheet,
        unshiftSheetRow,
        updateFiltersGroup,
        addNewRecord,
        updateFilters,
        changeBatchOptVisible,
      },
      dispatch,
    ),
)(errorBoundary(ViewComp));
