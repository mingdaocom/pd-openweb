import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import qs from 'querystring';
import LoadDiv from 'ming-ui/components/LoadDiv';
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
    const { appId, groupId, viewId } = match.params;
    updateBase({
      appId,
      viewId,
      groupId,
      worksheetId: id,
    });
    this.setCache(this.props.match.params);
  }
  componentWillReceiveProps(nextProps) {
    const { updateBase, worksheetId, updateWorksheetLoading } = nextProps;
    if (/\/app\/[\w-]+$/.test(location.pathname)) {
      return;
    }
    const id = this.getValidedWorksheetId(nextProps);
    const { appId, groupId, viewId } = nextProps.match.params;
    if (appId !== this.props.match.params.appId || groupId !== this.props.match.params.groupId) {
      updateWorksheetLoading(true);
    }
    if (
      appId !== this.props.match.params.appId ||
      viewId !== this.props.match.params.viewId ||
      groupId !== this.props.match.params.groupId ||
      id !== worksheetId
    ) {
      updateBase({
        appId,
        viewId,
        groupId,
        worksheetId: id,
      });
    }
    this.setCache(nextProps.match.params);
  }
  shouldComponentUpdate() {
    return !/\/app\/[\w-]+$/.test(location.pathname);
  }
  componentWillUnmount() {
    $(document.body).removeClass('fixedScreen');
    this.props.updateSheetListLoading(true);
  }
  /**
   * 设置缓存
   */
  setCache(params) {
    const { appId, groupId, worksheetId, viewId } = params;
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
        localStorage.setItem(`mdAppCache_${md.global.Account.accountId}_${params.appId}`, JSON.stringify(storage));
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

    localStorage.setItem(`mdAppCache_${md.global.Account.accountId}_${params.appId}`, JSON.stringify(storage));
  }
  getValidedWorksheetId(props) {
    const { match, sheetList, isCharge } = props || this.props;
    const possessSheetList = isCharge ? sheetList : sheetList.filter(item => item.status === 1);
    let id;
    if (match.params.worksheetId) {
      id = match.params.worksheetId;
    } else if (possessSheetList.length) {
      id = possessSheetList[0].workSheetId;
    }
    return id;
  }
  // 防止多次创建
  pending = false;
  handleCreateItem = (obj, callback) => {
    if (this.pending) return;
    const { match, addWorkSheet, updatePageInfo, updateEditPageVisible } = this.props;
    const { appId, groupId, viewId } = match.params;
    const { iconColor, projectId } = store.getState().appPkg;
    const { type, name, icon } = obj;
    this.pending = true;
    const enumType = type === 'worksheet' ? 0 : 1;

    const iconUrl = `https://filepub.mingdao.com/customIcon/${type === 'customPage' ? 'hr_workbench' : '1_0_home'}.svg`;

    addWorkSheet(
      {
        appId,
        appSectionId: groupId,
        name,
        iconColor,
        icon,
        projectId,
        iconUrl,
        type: enumType,
      },
      res => {
        const { pageId } = res;
        this.pending = false;
        if (type === 'customPage') {
          navigateTo(`/app/${appId}/${groupId}/${pageId}`);
          updatePageInfo({ pageName: name, pageId });
          updateEditPageVisible(true);
        }
      },
    );
  };
  renderRightComp = ({ id, appId, groupId, viewId, currentSheet }) => {
    const { sheetList, isCharge, sheetListLoading, match } = this.props;
    const { type } = currentSheet;
    if (sheetListLoading) {
      return <LoadDiv size="big" className="mTop32" />;
    }
    if (_.isEmpty(sheetList) || _.isEmpty(currentSheet)) {
      const emptySheet = id && _.isEmpty(currentSheet);
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
    if (type) {
      return <CustomPageContent ids={match.params} currentSheet={currentSheet} />;
    } else {
      return <Sheet flag={qs.parse((location.search || '').slice(1)).flag} />;
    }
  };
  render() {
    const { visible, sheetList, pageId, match } = this.props;
    const { appId, groupId } = match.params;
    const id = this.getValidedWorksheetId();
    const currentSheet = _.find(sheetList, { workSheetId: id }) || _.object();
    return (
      <div className="worksheet flexRow">
        <WorkSheetLeft appId={appId} groupId={groupId} id={id} onCreateItem={this.handleCreateItem} />
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
