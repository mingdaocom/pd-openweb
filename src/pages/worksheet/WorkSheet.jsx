import React, { Component, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import qs from 'query-string';
import { LoadDiv, WaterMark } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { WorkSheetLeft, WorkSheetPortal, WorksheetEmpty } from './common';
import Sheet from './common/Sheet';
import { updateBase, updateWorksheetLoading } from './redux/actions';
import { updateSheetListLoading } from 'src/pages/worksheet/redux/actions/sheetList';
import CustomPageContent from 'src/pages/customPage/pageContent';
import homeAppApi from 'src/api/homeApp';
import UnNormal from 'worksheet/views/components/UnNormal';
import { getSheetListFirstId, findSheet, moveSheetCache } from './util';
import './worksheet.less';
import _ from 'lodash';

let request = null;

const WorkSheetContainer = (props) => {
  const { appId, id, type, params, sheetListLoading, isCharge, sheetList, appGroups } = props;
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (_.isUndefined(type)) {
      if (id) {
        if (request && request.state() === 'pending' && request.abort) {
          request.abort();
        }
        request = homeAppApi.getPageInfo({
          appId,
          id,
          sectionId: params.groupId
        });
        request.then(data => {
          const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
          if (![1, 4].includes(data.resultCode) || (storage.lastWorksheetId === id && data.resultCode === 4)) {
            moveSheetCache(appId, params.groupId);
            homeAppApi.getAppFirstInfo({
              appId,
              appSectionId: params.groupId
            }).then(data => {
              navigateTo(`/app/${appId}/${data.appSectionId}/${data.workSheetId || ''}`);
            });
            return;
          }
          setData(data);
          setLoading(false);
        });
      }
    } else {
      setData({ wsType: type, resultCode: 1 });
      setLoading(false);
    }
  }, [id, params.groupId]);

  useEffect(() => {
    if (!id && params.groupId) {
      const firstSheetId = getSheetListFirstId(sheetList, isCharge);
      firstSheetId && navigateTo(`/app/${appId}/${params.groupId}/${firstSheetId}`);
    }
  }, [sheetList]);

  useEffect(() => {
    if (!id && !sheetListLoading) {
      // 没有表id，空分组
      setData({ wsType: type, resultCode: -20000 });
      setLoading(false);
    }
  }, [id, sheetListLoading]);

  if (id ? loading : sheetListLoading) {
    return (
      <LoadDiv size="big" className="mTop32" />
    );
  }

  if (data.resultCode !== 1) {
    if (data.resultCode === -20000) {
      return (
        <WorksheetEmpty
          appId={appId}
          groupId={params.groupId}
        />
      );
    } else {
      const res = appGroups.map(data => {
        const { appSectionId, workSheetInfo, childSections } = data;
        const child = childSections.map(data => {
          const { parentId } = data;
          return data.workSheetInfo.map(data => {
            return {
              ...data,
              appSectionId: parentId
            }
          });
        });
        return workSheetInfo.map(data => {
          return {
            ...data,
            appSectionId
          }
        }).concat(_.flatten(child));
      });
      const appItem = _.find(_.flatten(res), { workSheetId: id });
      return (
        <UnNormal type="sheet" resultCode={appItem && appItem.appSectionId !== params.groupId ? -20000 : (data.resultCode || -10000)} />
      );
    }
  }

  if (data.wsType) {
    return (
      id ? <CustomPageContent ids={{ ...params, appId }} id={id} /> : null
    );
  } else {
    return (
      <Sheet flag={qs.parse((location.search || '').slice(1)).flag} />
    );
  }
}

class WorkSheet extends Component {
  static propTypes = {
    sheetList: PropTypes.arrayOf(PropTypes.shape({})),
    sheetListLoading: PropTypes.bool,
  };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { match, updateBase } = this.props;
    $(document.body).addClass('fixedScreen');
    if (window.isPublicApp) {
      $(document.body).addClass('isPublicApp');
    }
    const id = this.getValidedWorksheetId(this.props);
    let { appId, groupId, viewId } = match.params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    updateBase({
      appId,
      viewId,
      groupId,
      worksheetId: id,
      chartId: new URL(location.href).searchParams.get('chartId'),
    });
    this.setCache(this.props.match.params);
    // 禁止浏览器触摸板触发的前进后退
    document.body.style.overscrollBehaviorX = 'none';
    document.addEventListener('keydown', this.changeFull);
  }
  componentWillReceiveProps(nextProps) {
    const { updateBase, worksheetId, updateWorksheetLoading, updateSheetListLoading } = nextProps;
    if (/\/app\/[\w-]+$/.test(location.pathname)) {
      return;
    }
    const id = this.getValidedWorksheetId(nextProps);
    let { appId, groupId, viewId } = nextProps.match.params;
    if (
      appId !== this.props.match.params.appId ||
      groupId !== this.props.match.params.groupId ||
      nextProps.match.params.worksheetId !== this.props.match.params.worksheetId
    ) {
      updateWorksheetLoading(true);
    }
    if (
      appId !== this.props.match.params.appId ||
      viewId !== this.props.match.params.viewId ||
      groupId !== this.props.match.params.groupId ||
      id !== worksheetId
    ) {
      if (md.global.Account.isPortal) {
        appId = md.global.Account.appId;
      }
      updateBase({
        appId,
        viewId,
        groupId,
        worksheetId: id,
      });
    }
    this.setCache(nextProps.match.params);
  }
  shouldComponentUpdate(nextProps) {
    return nextProps.sheetListLoading !== this.props.sheetListLoading || !/\/app\/[\w-]+$/.test(location.pathname);
  }
  componentWillUnmount() {
    this.props.updateSheetListLoading(true);
    $(document.body).removeClass('fixedScreen');
    // 取消禁止浏览器触摸板触发的前进后退
    document.body.style.overscrollBehaviorX = null;
    document.removeEventListener('keydown', this.changeFull);
  }
  changeFull(e) {
    const isMacOs = navigator.userAgent.toLocaleLowerCase().includes('mac os');
    if ((isMacOs ? e.metaKey : e.ctrlKey) && e.keyCode === 69) {
      const fullEl = document.querySelector('.icon.fullRotate');
      fullEl && fullEl.click();
    }
  }
  /**
   * 设置缓存
   */
  setCache(params) {
    let { appId, groupId, worksheetId, viewId } = params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    let storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`));

    if (!worksheetId) {
      // 兼容列表一个都没有的情况
      if (this.props.match.params.worksheetId && storage) {
        storage.worksheets = storage.worksheets || [];
        _.remove(
          storage.worksheets,
          item => item.groupId === groupId && item.worksheetId === this.props.match.params.worksheetId,
        );
        storage.lastWorksheetId = '';
        storage.lastViewId = '';
        safeLocalStorageSetItem(`mdAppCache_${md.global.Account.accountId}_${appId}`, JSON.stringify(storage));
      }
      return;
    }

    if (storage) {
      storage.worksheets = storage.worksheets || [];
      _.remove(storage.worksheets, item => item.groupId === groupId && item.worksheetId === worksheetId);
      storage.worksheets.push({ groupId, worksheetId, viewId });
    } else {
      storage = {
        worksheets: [{ groupId, worksheetId, viewId }],
      };
    }

    storage.lastGroupId = groupId;
    storage.lastWorksheetId = worksheetId;
    storage.lastViewId = viewId;

    safeLocalStorageSetItem(`mdAppCache_${md.global.Account.accountId}_${appId}`, JSON.stringify(storage));
  }
  getValidedWorksheetId(props) {
    const { match } = props || this.props;
    let id;
    if (match.params.worksheetId) {
      id = match.params.worksheetId;
    }
    return id;
  }
  render() {
    let { visible, sheetList = [], pageId, match, appPkg, isCharge, sheetListLoading } = this.props;
    const { projectId, currentPcNaviStyle, appGroups = [] } = appPkg;
    let { appId, groupId, worksheetId } = match.params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    const currentSheet = findSheet(worksheetId, sheetList) || {};
    return (
      <WaterMark projectId={projectId}>
        <div className="worksheet flexRow">
          {currentPcNaviStyle === 0 && (
            <WorkSheetLeft
              appId={appId}
              projectId={projectId}
              groupId={groupId}
              worksheetId={worksheetId}
              appPkg={appPkg}
              isCharge={isCharge}
            />
          )}
          {currentPcNaviStyle === 2 ? (
            worksheetId ? (
              <WorkSheetContainer
                appId={appId}
                id={worksheetId}
                type={currentSheet.type}
                params={match.params}
                sheetListLoading={sheetListLoading}
                isCharge={isCharge}
                sheetList={sheetList}
                appGroups={appGroups}
              />
            ) : (
              <WorkSheetPortal
                appId={appId}
                projectId={projectId}
                groupId={groupId}
                appPkg={appPkg}
                isCharge={isCharge}
              />
            )
          ) : (
            <WorkSheetContainer
              appId={appId}
              id={worksheetId}
              type={currentSheet.type}
              params={match.params}
              sheetListLoading={sheetListLoading}
              isCharge={isCharge}
              sheetList={sheetList}
              appGroups={appGroups}
            />
          )}
        </div>
      </WaterMark>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      sheetListLoading: state.sheetList.loading,
      sheetList: state.appPkg.currentPcNaviStyle === 1 ? state.sheetList.appSectionDetail : state.sheetList.data,
      worksheetId: state.sheet.base.worksheetId,
      isCharge: state.sheet.isCharge,
      appPkg: state.appPkg,
    }),
    dispatch =>
      bindActionCreators(
        {
          updateBase,
          updateWorksheetLoading,
          updateSheetListLoading
        },
        dispatch,
      ),
  )(errorBoundary(WorkSheet)),
);
