import React, { Component, Fragment, useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UseKey from 'react-use/lib/component/UseKey';
import { generate } from '@ant-design/colors';
import { TinyColor } from '@ctrl/tinycolor';
import _ from 'lodash';
import PropTypes from 'prop-types';
import qs from 'query-string';
import styled from 'styled-components';
import { LoadDiv, WaterMark } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import homeAppApi from 'src/api/homeApp';
import DragMask from 'worksheet/common/DragMask';
import UnNormal from 'worksheet/views/components/UnNormal';
import CreateRecordSideMask from 'src/components/Mingo/modules/CreateRecordBot/CreateRecordSideMask';
import Chatbot from 'src/pages/Chatbot';
import CustomPageContent from 'src/pages/customPage/pageContent';
import { updateSheetListLoading } from 'src/pages/worksheet/redux/actions/sheetList';
import { navigateTo } from 'src/router/navigateTo';
import { emitter } from 'src/utils/common';
import { browserIsMobile, updateGlobalStoreForMingo } from 'src/utils/common';
import { findSheet, getSheetListFirstId, moveSheetCache } from 'src/utils/worksheet';
import { WorksheetEmpty, WorkSheetLeft, WorkSheetPortal } from './common';
import Sheet from './common/Sheet';
import { updateBase, updateWorksheetLoading } from './redux/actions';
import './worksheet.less';

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 9;
  left: ${left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid #ddd;
  }
`,
);

let request = null;

const WorkSheetContainer = props => {
  const { appId, id, currentSheet, params, sheetListLoading, isCharge, sheetList, appPkg } = props;
  const { type } = currentSheet;
  const { appGroups = [], currentPcNaviStyle } = appPkg;
  const cache = useRef({});
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (_.isUndefined(type)) {
      if (id) {
        if (request && request.abort) {
          request.abort();
        }
        request = homeAppApi.getPageInfo({
          appId,
          id,
          sectionId: params.groupId,
        });
        request.then(data => {
          const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
          if (![1, 4].includes(data.resultCode) || (storage.lastWorksheetId === id && data.resultCode === 4)) {
            moveSheetCache(appId, params.groupId);
            homeAppApi
              .getAppFirstInfo({
                appId,
                appSectionId: params.groupId,
              })
              .then(data => {
                navigateTo(`/app/${appId}/${data.appSectionId}/${data.workSheetId || ''}`);
              });
            return;
          }
          setData(data);
          setLoading(false);
        });
      }
    } else {
      setTimeout(
        () => {
          setData({ wsType: type, resultCode: 1 });
          setLoading(false);
        },
        window.isWindows && window.isFirefox ? 500 : 200,
      );
    }
  }, [id, params.groupId]);

  useEffect(() => {
    if (!id && !sheetListLoading) {
      const firstSheetId = getSheetListFirstId(sheetList, isCharge);
      if (firstSheetId && params.groupId) {
        navigateTo(`/app/${appId}/${params.groupId}/${firstSheetId}`);
      } else {
        // 没有表id，空分组
        setData({ wsType: type, resultCode: -20000 });
        setLoading(false);
      }
    }
  }, [id, sheetListLoading, sheetList]);

  if (id ? loading : sheetListLoading) {
    return <LoadDiv size="big" className="mTop32" />;
  }

  if (data.resultCode !== 1) {
    if (data.resultCode === -20000) {
      return <WorksheetEmpty appId={appId} groupId={params.groupId} />;
    } else {
      const res = appGroups.map(data => {
        const { appSectionId, workSheetInfo = [], childSections = [] } = data;
        const child = childSections.map(data => {
          const { parentId } = data;
          return data.workSheetInfo.map(data => {
            return {
              ...data,
              appSectionId: parentId,
            };
          });
        });
        return workSheetInfo
          .map(data => {
            return {
              ...data,
              appSectionId,
            };
          })
          .concat(_.flatten(child));
      });
      const appItem = _.find(_.flatten(res), { workSheetId: id });
      return (
        <UnNormal
          type="sheet"
          resultCode={appItem && appItem.appSectionId !== params.groupId ? -20000 : data.resultCode || -10000}
        />
      );
    }
  }

  if (!id) {
    return null;
  }

  if (data.wsType === 0) {
    return (
      <Sheet
        flag={qs.parse((location.search || '').slice(1)).flag}
        setLoadRequest={loadRequest => (cache.current.loadRequest = loadRequest)}
        abortPrevWorksheetInfoRequest={() => {
          if (_.isFunction(_.get(cache, 'current.loadRequest.abort'))) {
            cache.current.loadRequest.abort();
          }
        }}
      />
    );
  }
  if (data.wsType === 1) {
    const currentSheet =
      currentPcNaviStyle === 2 && data.urlTemplate
        ? {
            urlTemplate: data.urlTemplate,
            configuration: data.configuration,
            workSheetName: data.name,
          }
        : undefined;
    return <CustomPageContent currentSheet={currentSheet} ids={{ ...params, appId }} id={id} />;
  }
  if (data.wsType === 3) {
    const name = currentSheet.workSheetName || data.name;
    return (
      <Chatbot
        data={{ ...currentSheet, name, appId, chatbotId: id, conversationId: params.viewId }}
        navigateToConversation={(conversationId, isReplace = false) => {
          navigateTo(`/app/${appId}/${params.groupId}/${id}/${conversationId || ''}`, isReplace);
        }}
      />
    );
  }

  return null;
};

class WorkSheet extends Component {
  static propTypes = {
    sheetList: PropTypes.arrayOf(PropTypes.shape({})),
    sheetListLoading: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    const { params } = props.match;
    this.state = {
      navWidth: Number(localStorage.getItem(`appNavWidth-${params.appId}`)) || 240,
      dragMaskVisible: false,
    };
    this.handleMingoCreateRecord = this.handleMingoCreateRecord.bind(this);
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
    updateGlobalStoreForMingo({
      activeModule: 'worksheet',
    });
    this.setCache(this.props.match.params);
    // 禁止浏览器触摸板触发的前进后退
    document.body.style.overscrollBehaviorX = 'none';
    emitter.on('MINGO_CREATE_RECORD', this.handleMingoCreateRecord);
  }
  componentWillReceiveProps(nextProps) {
    const { updateBase, worksheetId, updateWorksheetLoading, views } = nextProps;
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

      let defaultViewId = undefined;
      if (
        !viewId &&
        this.props.match.params.viewId === worksheetId &&
        worksheetId === nextProps.match.params.worksheetId
      ) {
        const showViews = views.filter(view => {
          const showhide = _.get(view, 'advancedSetting.showhide') || '';
          if (browserIsMobile()) {
            return !showhide.includes('spc&happ') && !showhide.includes('hide');
          }
          return !showhide.includes('hpc') && !showhide.includes('hide');
        });

        defaultViewId = _.get((showViews.length ? showViews : views)[0], 'viewId');
      }

      updateBase({
        appId,
        viewId: defaultViewId || viewId,
        groupId,
        worksheetId: id,
      });
      updateGlobalStoreForMingo({
        activeModule: 'worksheet',
      });
    }
    this.setCache(nextProps.match.params);
    if (
      _.get(this.props, 'appPkg.iconColor') !== _.get(nextProps, 'appPkg.iconColor') ||
      (!this.appThemeColorStyle && _.get(nextProps, 'appPkg.iconColor'))
    ) {
      this.changeAppThemeColor(_.get(nextProps, 'appPkg.iconColor'));
    }
  }
  shouldComponentUpdate(nextProps) {
    return nextProps.sheetListLoading !== this.props.sheetListLoading || !/\/app\/[\w-]+$/.test(location.pathname);
  }
  componentWillUnmount() {
    const { updateWorksheetLoading } = this.props;
    this.props.updateSheetListLoading(true);
    $(document.body).removeClass('fixedScreen');
    // 取消禁止浏览器触摸板触发的前进后退
    document.body.style.overscrollBehaviorX = null;
    this.removeAppThemeColor();
    updateWorksheetLoading(true);
    emitter.off('MINGO_CREATE_RECORD', this.handleMingoCreateRecord);
  }
  handleMingoCreateRecord() {
    this.setState({ createRecordSideMaskVisible: true });
  }
  changeAppThemeColor(themeColor) {
    if (themeColor) {
      this.removeAppThemeColor();
      const style = document.createElement('style');
      style.innerHTML = `:root { --app-primary-color: ${themeColor}; --app-primary-hover-color: ${new TinyColor(
        themeColor,
      )
        .darken(5)
        .toString()};  --app-highlight-color: ${generate(themeColor)[0].toString()}}`;
      document.head.appendChild(style);
      this.appThemeColorStyle = style;
    } else if (!themeColor && this.appThemeColorStyle) {
      this.removeAppThemeColor();
    }
  }
  removeAppThemeColor() {
    if (this.appThemeColorStyle) {
      document.head.removeChild(this.appThemeColorStyle);
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
    let { sheetList = [], match, appPkg, isCharge, sheetListLoading, sheetListIsUnfold } = this.props;
    const { projectId, currentPcNaviStyle } = appPkg;
    const { navWidth, dragMaskVisible, createRecordSideMaskVisible } = this.state;
    let { appId, groupId, worksheetId } = match.params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    const currentSheet = findSheet(worksheetId, sheetList) || {};
    return (
      <WaterMark projectId={projectId}>
        <UseKey
          filter={e => _.includes(['/'], e.key)}
          fn={e => {
            if (
              document.querySelector('.mdModalWrap') ||
              _.includes(['input', 'textarea'], (_.get(e, 'target.tagName') || '').toLowerCase())
            ) {
              return;
            }
            if ((window.isMacOs ? e.metaKey : e.ctrlKey) && e.keyCode === 191) {
              const fullEl = document.querySelector('.icon.fullRotate');
              fullEl && fullEl.click();
            }
          }}
        />
        <div className="worksheet flexRow">
          {currentPcNaviStyle === 0 && (
            <Fragment>
              {dragMaskVisible && (
                <DragMask
                  value={navWidth}
                  min={240}
                  max={480}
                  onChange={value => {
                    localStorage.setItem(`appNavWidth-${appId}`, value);
                    this.setState({
                      navWidth: value,
                      dragMaskVisible: false,
                    });
                  }}
                />
              )}
              {sheetListIsUnfold && (
                <Drag
                  left={navWidth}
                  className="appNavWidthDrag"
                  onMouseDown={() => {
                    this.setState({ dragMaskVisible: true });
                  }}
                />
              )}
              <WorkSheetLeft
                style={{ width: navWidth }}
                appId={appId}
                projectId={projectId}
                groupId={groupId}
                worksheetId={worksheetId}
                appPkg={appPkg}
                isCharge={isCharge}
              />
            </Fragment>
          )}
          {currentPcNaviStyle === 2 ? (
            worksheetId ? (
              <WorkSheetContainer
                appId={appId}
                id={worksheetId}
                currentSheet={currentSheet}
                params={match.params}
                sheetListLoading={sheetListLoading}
                isCharge={isCharge}
                sheetList={sheetList}
                appPkg={appPkg}
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
              currentSheet={currentSheet}
              params={match.params}
              sheetListLoading={sheetListLoading}
              isCharge={isCharge}
              sheetList={sheetList}
              appPkg={appPkg}
            />
          )}
        </div>
        {createRecordSideMaskVisible && (
          <CreateRecordSideMask
            appId={appId}
            worksheetId={worksheetId}
            viewId={match.params.viewId}
            onClose={() => this.setState({ createRecordSideMaskVisible: false })}
          />
        )}
      </WaterMark>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      sheetListLoading: state.sheetList.loading,
      sheetListIsUnfold: state.sheetList.isUnfold,
      sheetList: [1, 3].includes(state.appPkg.currentPcNaviStyle)
        ? state.sheetList.appSectionDetail
        : state.sheetList.data,
      worksheetId: state.sheet.base.worksheetId,
      isCharge: state.sheet.isCharge,
      appPkg: state.appPkg,
      views: _.get(state, 'sheet.views'),
    }),
    dispatch =>
      bindActionCreators(
        {
          updateBase,
          updateWorksheetLoading,
          updateSheetListLoading,
        },
        dispatch,
      ),
  )(errorBoundary(WorkSheet)),
);
