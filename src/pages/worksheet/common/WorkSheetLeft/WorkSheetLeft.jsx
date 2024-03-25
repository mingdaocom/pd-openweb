import React, { Component, Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { ScrollView, Icon, Tooltip, Skeleton } from 'ming-ui';
import Guidance from 'src/pages/worksheet/components/Guidance';
import * as sheetListActions from 'src/pages/worksheet/redux/actions/sheetList';
import WorkSheetItem from './WorkSheetItem';
import WorkSheetGroup from './WorkSheetGroup';
import CreateAppItem from './CreateAppItem';
import './WorkSheetLeft.less';
import { getAppFeaturesVisible } from 'src/util';
import _ from 'lodash';

function getProjectfoldedFromStorage() {
  let result = {};
  const storageStr = window.localStorage.getItem(`worksheet_left_projectfolded_${md.global.Account.accountId}`);
  if (!storageStr) {
    return result;
  }
  try {
    result = JSON.parse(storageStr);
  } catch (err) {
    return {};
  }
  return result;
}

class WorkSheetLeft extends Component {
  static propTypes = {
    worksheetId: PropTypes.string,
    sheetListActions: PropTypes.object,
    sheetList: PropTypes.array,
    activeSheetId: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      projectFolded: getProjectfoldedFromStorage(),
    };
  }
  componentWillMount = function () {
    this.getSheetList(this.props);
  };
  componentWillUnmount() {
    this.props.sheetListActions.updateSheetListLoading(true);
    this.props.sheetListActions.clearSheetList();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.groupId !== this.props.groupId) {
      this.getSheetList(nextProps);
    }
    if (!_.isEqual(nextProps.groupData, this.props.groupData)) {
      this.getSheetList(nextProps);
    }
  }
  getSheetList = props => {
    const { appId, groupId, groupData } = props || this.props;
    if (groupData) {
      this.props.sheetListActions.updateSheetList(groupData);
      this.props.sheetListActions.updateSheetListLoading(false);
    } else if (appId && groupId) {
      this.props.sheetListActions.getSheetList({
        appId,
        appSectionId: groupId,
      });
    }
  };
  get data() {
    const { data, isCharge, appPkg } = this.props;
    const isOperation = appPkg.permissionType === 2;
    const filterEmptyAppItem =
      isCharge || isOperation ? item => true : item => !(item.type === 2 && _.isEmpty(item.items));
    return (isCharge || isOperation) && appPkg.viewHideNavi
      ? data
      : data.filter(item => item.status === 1 && !item.navigateHide).filter(filterEmptyAppItem);
  }
  renderSheetAppItem(item, workSheetItemProps, index) {
    const { groupId } = this.props;
    const isAppItem = item.type !== 2;
    const Wrap = isAppItem ? WorkSheetItem : WorkSheetGroup;
    item.layerIndex = 1;
    item.isAppItem = isAppItem;
    item.parentId = groupId;
    item.index = index;
    return <Wrap key={item.workSheetId} appItem={item} {...workSheetItemProps} />;
  }
  renderContent(data) {
    const { worksheetId, isCharge, appPkg, secondLevelGroup = false } = this.props;
    const { appId, projectId, groupId, sheetListActions } = this.props;
    const Wrap = secondLevelGroup ? Fragment : ScrollView;
    const isUnfold = appPkg.currentPcNaviStyle === 0 ? this.props.isUnfold : true;
    const workSheetItemProps = {
      appId,
      groupId,
      sheetList: data,
      activeSheetId: worksheetId,
      sheetListActions,
      isCharge,
      sheetListVisible: isUnfold,
      appPkg,
      projectId,
    };
    return (
      <Fragment>
        <div className="flex flexColumn">
          <Wrap>
            <DndProvider key="navigationList" context={window} backend={HTML5Backend}>
              {data.map((item, index) => this.renderSheetAppItem(item, workSheetItemProps, index))}
            </DndProvider>
            {!secondLevelGroup && (
              <CreateAppItem
                isCharge={isCharge}
                isUnfold={isUnfold}
                projectId={projectId}
                appId={appId}
                groupId={groupId}
                sheetListActions={sheetListActions}
                getSheetList={this.getSheetList}
              />
            )}
          </Wrap>
        </div>
        {!secondLevelGroup && (
          <div className="unfoldWrap TxtRight">
            <Tooltip text={<span>{isUnfold ? _l('收起导航') : _l('展开导航')}</span>}>
              <Icon
                icon={isUnfold ? 'menu_left' : 'menu_right'}
                className="Font20 Gray_9e pointer unfoldIcon"
                onClick={() => {
                  safeLocalStorageSetItem('sheetListIsUnfold', !isUnfold);
                  sheetListActions.updateSheetListIsUnfold(!isUnfold);
                }}
              />
            </Tooltip>
          </div>
        )}
      </Fragment>
    );
  }
  render() {
    const { worksheetId, loading, isUnfold, guidanceVisible, secondLevelGroup = false, appPkg } = this.props;
    const { data } = this;
    const sheetInfo = _.find(data, { workSheetId: worksheetId }) || {};

    // 获取url参数
    const { ln } = getAppFeaturesVisible();
    return (
      <div
        className={cx('workSheetLeft flexRow', {
          workSheetLeftHide: appPkg.currentPcNaviStyle === 0 ? !isUnfold && ln : false,
          hide: !ln,
        })}
      >
        {secondLevelGroup ? (
          this.renderContent(data)
        ) : loading || _.isEmpty(data) ? (
          <Skeleton active={true} />
        ) : (
          this.renderContent(data)
        )}
        {guidanceVisible && sheetInfo.type === 0 && (
          <Guidance
            sheetListVisible={isUnfold}
            onClose={() => {
              this.props.sheetListActions.updateGuidanceVisible(false);
            }}
          />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  sheetListActions: bindActionCreators(sheetListActions, dispatch),
  dispatch,
});

const mapStateToProps = state => ({
  data: state.sheetList.data,
  loading: state.sheetList.loading,
  isUnfold: state.sheetList.isUnfold,
  guidanceVisible: state.sheetList.guidanceVisible,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkSheetLeft);
