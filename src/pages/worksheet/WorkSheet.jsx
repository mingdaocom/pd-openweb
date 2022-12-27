import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import qs from 'query-string';
import { LoadDiv, WaterMark } from 'ming-ui';
import store from 'redux/configureStore';
import { navigateTo } from 'src/router/navigateTo';
import CustomPage from 'src/pages/customPage';
import { updatePageInfo, updateEditPageVisible } from 'src/pages/customPage/redux/action';
import { WorkSheetLeft, WorksheetEmpty } from './common';
import Sheet from './common/Sheet';
import { updateBase, updateWorksheetLoading } from './redux/actions';
import { addWorkSheet, updateSheetListLoading } from 'src/pages/worksheet/redux/actions/sheetList';
import CustomPageContent from 'worksheet/components/CustomPageContent';
import './worksheet.less';
import _ from 'lodash';

@connect(undefined, dispatch => ({
  addWorkSheet: bindActionCreators(addWorkSheet, dispatch),
  updateSheetListLoading: bindActionCreators(updateSheetListLoading, dispatch),
}))
class WorkSheet extends Component {
  static propTypes = {
    sheetList: PropTypes.arrayOf(PropTypes.shape({})),
    sheetListLoading: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      customPageConfigVisible: false,
    };
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
  }
  componentWillReceiveProps(nextProps) {
    const { updateBase, worksheetId, updateWorksheetLoading } = nextProps;
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
    $(document.body).removeClass('fixedScreen');
    this.props.updateSheetListLoading(true);
    // 取消禁止浏览器触摸板触发的前进后退
    document.body.style.overscrollBehaviorX = null;
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
    const { match, sheetList, isCharge } = props || this.props;
    const possessSheetList = isCharge ? sheetList : sheetList.filter(item => item.status === 1 && !item.navigateHide);
    let id;
    if (match.params.worksheetId) {
      id = match.params.worksheetId;
    } else if (possessSheetList.length) {
      // 以前是直接返回第一个表作为默认值会后面切换视图时新旧 worksheetId 比对出错，改为 navigate
      if (match.params.appId && match.params.groupId) {
        navigateTo(
          `/app/${match.params.appId}/${match.params.groupId}/${possessSheetList[0].workSheetId}${
            location.search || ''
          }`,
        );
      } else {
        id = possessSheetList[0].workSheetId;
      }
    }
    return id;
  }
  // 防止多次创建
  pending = false;
  handleCreateItem = (obj, callback) => {
    if (this.pending) return;
    const { match, addWorkSheet, updatePageInfo, updateEditPageVisible } = this.props;
    let { appId, groupId, viewId } = match.params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    const { iconColor, projectId } = store.getState().appPkg;
    const { type, name } = obj;
    this.pending = true;
    const enumType = type === 'worksheet' ? 0 : 1;

    const iconUrl = `${md.global.FileStoreConfig.pubHost}customIcon/${
      type === 'customPage' ? 'dashboard' : 'table'
    }.svg`;

    addWorkSheet(
      {
        appId,
        appSectionId: groupId,
        name,
        iconColor,
        projectId,
        iconUrl,
        type: enumType,
      },
      res => {
        this.pending = false;
        const { pageId } = res;
        if (type === 'customPage') {
          navigateTo(`/app/${appId}/${groupId}/${pageId}`);
          updatePageInfo({ pageName: name, pageId });
          updateEditPageVisible(true);
        }
      },
    );
  };
  renderRightComp = ({ id, appId, groupId, currentSheet }) => {
    const { sheetList, isCharge, sheetListLoading, match } = this.props;
    const { type } = currentSheet;
    if (sheetListLoading) {
      return <LoadDiv size="big" className="mTop32" />;
    }
    if ((_.isEmpty(sheetList) || _.isEmpty(currentSheet)) && !md.global.Account.isPortal) {
      const emptySheet = id && _.isEmpty(currentSheet);
      if (
        !_.isEmpty(sheetList.filter(s => s.appId === appId && s.appSectionId === groupId)) &&
        new URL(location.href).searchParams.get('from') === 'insite'
      ) {
        navigateTo(`/app/${appId}${groupId ? '/' + groupId : ''}`, true);
        return;
      }
      return (
        <WorksheetEmpty
          sheetCount={sheetList.length}
          appId={appId}
          groupId={groupId}
          isCharge={sheetList.length && emptySheet ? false : isCharge}
          onCreateItem={this.handleCreateItem}
        />
      );
    }

    return type ? (
      <CustomPageContent ids={match.params} currentSheet={currentSheet} />
    ) : (
      <Sheet flag={qs.parse((location.search || '').slice(1)).flag} />
    );
  };
  render() {
    let { visible, sheetList = [], pageId, match, isCharge } = this.props;
    const { projectId } = store.getState().appPkg;
    let { appId, groupId } = match.params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    const id = this.getValidedWorksheetId();
    const currentSheet = _.find(sheetList, { workSheetId: id }) || {};

    return (
      <WaterMark projectId={projectId}>
        <div className="worksheet flexRow">
          <WorkSheetLeft
            appId={appId}
            projectId={projectId}
            groupId={groupId}
            id={id}
            onCreateItem={this.handleCreateItem}
          />
          {this.renderRightComp({ ...match.params, currentSheet, id })}

          {visible &&
            ReactDOM.createPortal(
              <CustomPage
                updateName={name =>
                  this.updateName({ appId, groupId, name, workSheetId: pageId || id, icon: currentSheet.icon })
                }
                sheetList={sheetList}
                ids={{ appId, groupId, pageId: pageId || id }}
              />,
              document.body,
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
      sheetList: state.sheetList.data,
      isCharge: state.sheetList.isCharge,
      worksheetId: state.sheet.base.worksheetId,
      ..._.pick(state.customPage, ['visible', 'pageId']),
    }),
    dispatch =>
      bindActionCreators(
        {
          updateBase,
          updateWorksheetLoading,
          updatePageInfo,
          updateEditPageVisible,
        },
        dispatch,
      ),
  )(errorBoundary(WorkSheet)),
);
