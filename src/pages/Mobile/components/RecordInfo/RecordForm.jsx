import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import CustomFields from 'src/components/newCustomFields';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import SheetWorkflow from 'src/pages/workflow/components/SheetWorkflow';
import FormCover from 'worksheet/common/recordInfo/RecordForm/FormCover';
import DocumentTitle from 'react-document-title';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import * as actions from 'mobile/RelationRow/redux/actions';
import PayLog from 'src/pages/worksheet/components/DiscussLogFile/PayLog.jsx';
import worksheetSettingAjax from 'src/api/worksheetSetting';
import _ from 'lodash';

@connect(
  state => ({ ..._.pick(state.mobile, ['relationRow', 'loadParams']) }),
  dispatch => bindActionCreators({ ..._.pick(actions, ['updatePageIndex']) }, dispatch),
)
export default class RecordForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      approveCount: 0,
      enableOrderVisible: false,
    };
    this.isLoadApprove =
      props.getDataType !== 21 &&
      !props.isPublicShare &&
      !_.get(window, 'shareState.isPublicForm') &&
      !_.get(window, 'shareState.isPublicWorkflowRecord');
  }
  componentDidMount() {
    if (this.isLoadApprove) {
      this.getApproveTodoList();
      const { recordInfo, recordBase } = this.props;
      worksheetSettingAjax
        .getRowDetailIsShowOrder({
          appId: recordBase.appId,
          projectId: recordInfo.projectId,
          worksheetId: recordBase.worksheetId,
        })
        .then(data => {
          this.setState({ enableOrderVisible: data });
        });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.currentTab, nextProps.currentTab)) {
      this.setState({ loadMoreRelateCards: false });
    }
  }
  getApproveTodoList() {
    const { recordInfo, recordBase } = this.props;
    instanceVersion
      .getTodoCount2({
        startAppId: recordBase.worksheetId,
        startSourceId: recordBase.recordId,
      })
      .then(data => {
        this.setState({ approveCount: data });
      });
  }
  handleScroll = event => {
    const {
      isEditRecord,
      recordBase,
      currentTab,
      relationRow,
      loadParams,
      updatePageIndex = () => {},
      view = {},
      workflow,
    } = this.props;
    if (isEditRecord || !this.formWrap) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = this.formWrap;
    const targetVlaue = scrollHeight - clientHeight - 30;
    const { loading, isMore, pageIndex } = loadParams;
    const isLoadMore = _.includes([29, 51], currentTab.type) ? relationRow.count : currentTab.value;
    if (workflow && currentTab.type === 29 && targetVlaue <= scrollTop) {
      this.setState({ loadMoreRelateCards: true });
    } else if (targetVlaue <= scrollTop && isLoadMore && !loading && isMore) {
      updatePageIndex(pageIndex + 1);
    }
    const wrapEl = document.querySelector(`.mobileSheetRowRecord-${recordBase.recordId}`);
    const tabsEl = wrapEl.querySelector('.tabsWrapper');
    const fixedTabsEl = wrapEl.querySelector('.fixedTabs');
    const fixedSheetNameWrapEl = wrapEl.querySelector('.fixedSheetNameWrap');
    const mobileFormTopEl = wrapEl.querySelector('.mobileFormTop');

    if (fixedSheetNameWrapEl) {
      if (scrollTop >= mobileFormTopEl.clientHeight) {
        fixedSheetNameWrapEl && fixedSheetNameWrapEl.classList.add('fixedSheetNameWrapBG');
      } else {
        fixedSheetNameWrapEl && fixedSheetNameWrapEl.classList.remove('fixedSheetNameWrapBG');
      }
    }
    if (tabsEl && tabsEl.offsetTop - 55 <= scrollTop) {
      fixedTabsEl && fixedTabsEl.classList.remove('hide');
    } else {
      fixedTabsEl && fixedTabsEl.classList.add('hide');
    }
    if (view.viewType === 6 && view.childType === 1) {
      fixedTabsEl && fixedTabsEl.classList.add('top43');
    }
  };

  renderApprove = () => {
    const { isEditRecord, externalPortalConfig, recordInfo, recordBase, workflow, formData } = this.props;
    const { approveCount, enableOrderVisible } = this.state;
    const allowApprove =
      this.isLoadApprove &&
      isOpenPermit(permitList.approveDetailsSwitch, recordInfo.switchPermit, recordBase.viewId) &&
      (md.global.Account.isPortal ? externalPortalConfig.approved : true);

    const getList = () => {
      if (workflow) {
        return [];
      }
      if (allowApprove && !isEditRecord) {
        return [
          {
            controlName: _l('审批') + (approveCount ? `(${approveCount})` : ''),
            controlId: 'approve',
            showTabLine: true,
            tabContentNode: (
              <div className="flexColumn h100" style={{ backgroundColor: '#f8f8f8' }}>
                <SheetWorkflow
                  isCharge={recordInfo.roleType === 2}
                  projectId={recordInfo.projectId}
                  worksheetId={recordBase.worksheetId}
                  recordId={recordBase.recordId}
                  controls={formData}
                />
              </div>
            ),
          },
        ];
      } else {
        return [];
      }
    };
    let list = getList();
    if (enableOrderVisible) {
      list = [
        ...list,
        {
          controlName: _l('支付'),
          controlId: 'pay',
          tabContentNode: (
            <div className="flexColumn h100" style={{ backgroundColor: '#f8f8f8' }}>
              <PayLog
                projectId={recordInfo.projectId}
                worksheetId={recordBase.worksheetId}
                rowId={recordBase.recordId}
                appId={recordBase.appId}
              />
            </div>
          ),
        },
      ];
    }
    return list;
  };
  renderHeader({ formCoverVisible } = {}) {
    const {
      getDataType,
      onClose,
      random,
      isEditRecord,
      recordInfo,
      recordBase,
      formData,
      header,
      controlProps,
      refreshBtnNeedLoading,
      view = {},
    } = this.props;
    const { advancedSetting, formStyleImggeData } = recordInfo;

    if (isEditRecord) return;

    const isCoverid = _.get(advancedSetting, 'coverid') && !_.isEmpty(formStyleImggeData);

    if ((!formCoverVisible && isCoverid) || (formCoverVisible && !isCoverid)) {
      return;
    }

    const refreshRecordIcon = (
      <div className={cx('refreshWrap', { isLoading: refreshBtnNeedLoading })} onClick={controlProps.refreshRecord}>
        <Icon className="Font18" icon="task-later" />
      </div>
    );
    const sheetInfo = (
      <div
        className="sheetName flex bold"
        onClick={() => {
          if (location.pathname.indexOf('public') > -1 || window.isPublicApp || md.global.Account.isPortal) return;
          window.mobileNavigateTo &&
            window.mobileNavigateTo(
              `/mobile/recordList/${recordBase.appId}/${recordInfo.groupId}/${recordBase.worksheetId}`,
            );
          onClose && onClose();
        }}
      >
        <span className="ellipsis">{_l('工作表：%0', recordInfo.worksheetName)}</span>
      </div>
    );
    const closeIcon = onClose && (
      <Icon icon="closeelement-bg-circle" className="Gray_9e Font22 mLeft5" onClick={onClose} />
    );

    if (formCoverVisible && isCoverid) {
      // 渲染封面
      return (
        <div className="mobileFormTop Relative">
          <FormCover
            flag={random.toString()}
            formData={formData}
            widgetStyle={advancedSetting}
            worksheetId={recordBase.worksheetId}
            recordId={recordBase.recordId}
          />
          <div
            className={cx('flexRow sheetNameWrap fixedSheetNameWrap', {
              Absolute: view.viewType === 6 && view.childType === 1,
            })}
          >
            <div className="flexRow alignItemsCenter">
              {refreshRecordIcon}
              {sheetInfo}
            </div>
            {closeIcon}
          </div>
        </div>
      );
    }

    // 审批详情 header
    if (header) {
      return (
        <div className="flexRow sheetNameWrap">
          {header}
          {closeIcon}
        </div>
      );
    }

    return (
      <div className="flexRow sheetNameWrap">
        <div className="flexRow alignItemsCenter">
          {getDataType === 21 ? (
            <div className="sheetName ellipsis">{`${advancedSetting.title || '创建记录'}（${_l('草稿')}）`}</div>
          ) : (
            <Fragment>
              {refreshRecordIcon}
              {sheetInfo}
            </Fragment>
          )}
        </div>
        {closeIcon}
      </div>
    );
  }
  renderCustomFields() {
    const {
      customwidget,
      random,
      isModal,
      isEditRecord,
      recordInfo,
      recordBase,
      formData,
      getDataType,
      registerCell,
      controlProps,
      changeMobileTab,
      loadDraftChildTableData,
      workflow,
      currentTab,
    } = this.props;
    const { from } = recordBase;
    const approveInfo = this.renderApprove();
    const NOT_LOGIN_HIDDEN_TYPES = [26, 27, 21, 48];

    return (
      <div
        className={cx('flex customFieldsWrapper', {
          edit: isEditRecord,
          overflowHidden: !isEditRecord && _.includes([29, 51], currentTab.type) && !window.isDingTalk,
        })}
        ref={con => (this.con = con)}
      >
        <CustomFields
          ref={customwidget}
          isCharge={recordBase.isCharge}
          ignoreLock={from === RECORD_INFO_FROM.WORKFLOW || from === RECORD_INFO_FROM.DRAFT}
          showError={false}
          disabled={workflow ? !recordInfo.allowEdit : !isEditRecord}
          from={from === 21 ? from : recordBase.recordId && !isEditRecord ? 3 : 6}
          flag={random.toString()}
          projectId={recordInfo.projectId}
          appId={recordBase.appId}
          worksheetId={recordBase.worksheetId}
          viewId={recordBase.viewId}
          recordId={recordBase.recordId}
          groupId={recordBase.groupId}
          rules={recordInfo.rules}
          controlProps={controlProps}
          loadDraftChildTableData={loadDraftChildTableData}
          registerCell={registerCell}
          isWorksheetQuery={recordInfo.isWorksheetQuery}
          recordCreateTime={recordInfo.createTime}
          data={formData.filter(item => {
            return (
              (isEditRecord ? true : item.type !== 43) &&
              !(_.get(window, 'shareState.isPublicForm') && _.includes(NOT_LOGIN_HIDDEN_TYPES, item.type))
            );
          })}
          onChange={this.props.onChange}
          onSave={this.props.onSave}
          sheetSwitchPermit={recordInfo.switchPermit}
          widgetStyle={recordInfo.advancedSetting}
          verifyAllControls={getDataType === 21}
          tabControlProp={{
            otherTabs: approveInfo,
            changeMobileTab,
          }}
          mobileApprovalRecordInfo={{
            instanceId: recordBase.instanceId,
            workId: recordBase.workId,
          }}
          loadMoreRelateCards={this.state.loadMoreRelateCards}
        />
      </div>
    );
  }
  render() {
    const { isModal, isEditRecord, recordInfo, recordBase, formData, workflow, currentTab } = this.props;
    const { entityName, rules } = recordInfo;
    const recordTitle = getTitleTextFromControls(formData);
    return (
      <Fragment>
        {this.renderHeader()}
        <div
          ref={ele => (this.formWrap = ele)}
          className="flexColumn flex recordScroll"
          style={{ overflowX: 'hidden', overflowY: 'auto' }}
          onScroll={this.handleScroll}
        >
          <DocumentTitle
            title={
              isEditRecord
                ? `${_l('编辑')}${entityName}`
                : recordTitle
                ? `${recordTitle}`
                : `${entityName}${_l('详情')}`
            }
          />
          {this.renderHeader({ formCoverVisible: true })}
          {!isEditRecord && (
            <div className={cx('header', { pTop10: !isModal })}>
              <div className="title">{recordTitle}</div>
            </div>
          )}
          <div className="flex">{this.renderCustomFields()}</div>
          {!_.includes([29, 51], currentTab.type) && workflow && workflow({ formData })}
        </div>
      </Fragment>
    );
  }
}
