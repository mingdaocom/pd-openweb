import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, PullToRefreshWrapper } from 'ming-ui';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import * as actions from 'mobile/RelationRow/redux/actions';
import FormCover from 'worksheet/common/recordInfo/RecordForm/FormCover';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { controlState, getTitleTextFromControls } from 'src/components/Form/core/utils.js';
import CustomFields from 'src/components/newCustomFields';
import RecordPay from 'src/components/RecordPay';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { selectUser } from 'src/pages/Mobile/components/SelectUser';
import SheetWorkflow from 'src/pages/workflow/components/SheetWorkflow';
import { updateRecordOwner } from 'src/pages/worksheet/common/recordInfo/crtl.js';
import PayLog from 'src/pages/worksheet/components/DiscussLogFile/PayLog';
import { getRequest } from 'src/utils/common';
import { compatibleMDJS, handleReplaceState } from 'src/utils/project';

const LockWrap = styled.div`
  .lockContent {
    display: flex;
    align-items: center;
    padding-top: 10px;

    .lockIcon {
      font-size: 16px;
      color: var(--gray-75);

      i {
        margin-right: 12px;
      }
    }
  }
`;

@connect(
  state => ({ ..._.pick(state.mobile, ['relationRow', 'loadParams']) }),
  dispatch => bindActionCreators({ ..._.pick(actions, ['updatePageIndex']) }, dispatch),
)
export default class RecordForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      approveCount: 0,
    };
    this.isLoadApprove =
      props.getDataType !== 21 &&
      !props.isPublicShare &&
      !_.get(window, 'shareState.isPublicForm') &&
      !_.get(window, 'shareState.isPublicWorkflowRecord') &&
      !window.isPublicApp;
  }
  componentDidMount() {
    if (this.isLoadApprove) {
      this.getApproveTodoList();
    }

    // 兼容ios返回关闭确认支付弹层
    window.addEventListener('pagehide', () => {
      $('.mobilePayOrderDialog').parent().parent().remove();
    });
  }

  getApproveTodoList() {
    const { recordBase } = this.props;
    instanceVersion
      .getTodoCount2({
        startAppId: recordBase.worksheetId,
        startSourceId: recordBase.recordId,
      })
      .then(data => {
        this.setState({ approveCount: data });
      });
  }
  handleScroll = () => {
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
    const targetVlaue = workflow ? scrollHeight - clientHeight - 5 : scrollHeight - clientHeight - 30;
    const { loading, isMore, pageIndex } = loadParams;
    const isLoadMore = _.includes([29, 51], currentTab.type) ? relationRow.count : currentTab.value;
    if (targetVlaue <= scrollTop && isLoadMore && !loading && isMore) {
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
    const fixedTopHeight = window.shareState.isPublicRecord ? 0 : 55;
    if (tabsEl && tabsEl.offsetTop - fixedTopHeight <= scrollTop && !workflow) {
      fixedTabsEl && fixedTabsEl.classList.remove('hide');
    } else {
      fixedTabsEl && fixedTabsEl.classList.add('hide');
    }
    if (view.viewType === 6 && view.childType === 1) {
      fixedTabsEl && fixedTabsEl.classList.add('top41');
    }
  };

  renderApprove = () => {
    const {
      isEditRecord,
      externalPortalConfig,
      recordInfo,
      recordBase,
      workflow,
      formData,
      payConfig,
      updatePayConfig = () => {},
      isRecordLock,
    } = this.props;
    const { approveCount } = this.state;
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
                  appId={recordBase.appId}
                  isCharge={recordInfo.roleType === 2}
                  isRecordLock={isRecordLock}
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
    if (payConfig.rowDetailIsShowOrder && !_.get(window, 'shareState.isPublicRecord') && this.isLoadApprove) {
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
                viewId={recordBase.viewId}
                updatePayConfig={updatePayConfig}
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
      view = {},
      updateRecordDialogOwner = () => {},
      isRecordLock,
    } = this.props;
    const { advancedSetting, formStyleImggeData, ownerAccount, allowEdit, projectId, entityName } = recordInfo;
    const { worksheetId, recordId, appId } = recordBase || {};
    const isPublicShare =
      _.get(window, 'shareState.isPublicRecord') ||
      _.get(window, 'shareState.isPublicView') ||
      _.get(window, 'shareState.isPublicPage');

    if (isEditRecord) return null;

    const isCoverid = _.get(advancedSetting, 'coverid') && !_.isEmpty(formStyleImggeData);
    const ownerControl = _.find(formData, c => c.controlId === 'ownerid');
    const showOwner =
      ownerControl &&
      !_.isEmpty(ownerAccount) &&
      !_.find(view.controls, controlId => controlId === 'ownerid') &&
      (controlState(ownerControl).visible || ownerControl.controlId === 'ownerid');
    const ownerEditable =
      ownerControl &&
      allowEdit &&
      controlState(ownerControl).editable &&
      recordBase.from !== RECORD_INFO_FROM.DRAFT &&
      !window.isPublicApp;

    if ((!formCoverVisible && isCoverid) || (formCoverVisible && !isCoverid)) {
      return;
    }

    const sheetInfo = (
      <Fragment>
        {getDataType === 21 ? (
          <div className="sheetName ellipsis">{_l('编辑草稿')}</div>
        ) : (
          <div
            className="sheetName bold"
            onClick={() => {
              if (location.pathname.indexOf('public') > -1 || window.isPublicApp || md.global.Account.isPortal) return;
              const { page } = getRequest();
              if (window.isMingDaoApp) {
                handleReplaceState(
                  'page',
                  page === 'recordDetail' ? 'recordDetail' : _.isArray(page) ? page[page.length - 1] : '',
                );
              }
              window.mobileNavigateTo &&
                window.mobileNavigateTo(
                  `/mobile/recordList/${recordBase.appId}/${recordInfo.groupId}/${recordBase.worksheetId}`,
                );
              onClose && onClose();
            }}
          >
            <span className="ellipsis">{recordInfo.worksheetName}</span>
          </div>
        )}
        <div className="flex"></div>
        {showOwner && (
          <div
            className="owner sheetName bold mLeft6"
            onClick={() => {
              if (!ownerEditable || isRecordLock) return;

              const handleUpdateOwner = async users => {
                try {
                  const { account, record } = await updateRecordOwner({
                    worksheetId,
                    recordId,
                    accountId:
                      users[0].accountId === 'user-self'
                        ? _.get(md, ['global', 'Account', 'accountId'])
                        : users[0].accountId,
                  });
                  updateRecordDialogOwner(account, record);
                  alert(_l('修改成功'));
                } catch (err) {
                  if (err && err.resultCode === 72) {
                    alert(_l('%0已锁定，修改失败', entityName), 3);
                    return;
                  }
                  console.log(err);
                  alert(_l('修改失败'), 2);
                }
              };

              compatibleMDJS(
                'chooseUsers',
                {
                  projectId, // 网络ID, 默认为空, 不限制
                  count: 1, // 默认为空, 不限制数量
                  selected: [],
                  success: function (res) {
                    // 最终选择结果, 完全替换已有数据
                    if (_.isEmpty(res.results)) {
                      return;
                    }
                    handleUpdateOwner(res.results);
                  },
                  cancel: function () {
                    // 用户取消
                  },
                },
                () => {
                  selectUser({
                    type: 'user',
                    projectId,
                    appId,
                    onlyOne: true,
                    hideClearBtn: true,
                    userType: 3,
                    filterAccountIds: [ownerAccount.accountId],
                    includeUndefinedAndMySelf: true,
                    onSave: users => handleUpdateOwner(users),
                  });
                },
              );
            }}
          >
            <span className="ellipsis">{_l('拥有者：%0', ownerAccount.fullname)}</span>
          </div>
        )}
      </Fragment>
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
          {!isPublicShare && (
            <div
              className={cx('flexRow sheetNameWrap fixedSheetNameWrap', {
                Absolute: view.viewType === 6 && view.childType === 1,
              })}
            >
              <div className="flexRow alignItemsCenter w100">
                {/* {refreshRecordIcon} */}
                {sheetInfo}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 审批详情 header
    if (header) {
      return <div className="flexRow sheetNameWrap">{header}</div>;
    }

    if (isPublicShare) return null;
    return (
      <div className="flexRow sheetNameWrap">
        <div className="flexRow alignItemsCenter w100">
          {/* {getDataType !== 21 && refreshRecordIcon} */}
          {sheetInfo}
        </div>
      </div>
    );
  }
  renderCustomFields() {
    const {
      customwidget,
      random,
      isEditRecord,
      recordInfo,
      recordBase,
      formData,
      getDataType,
      registerCell,
      controlProps,
      changeMobileTab,
      workflow,
      currentTab,
      isDraft,
      view,
    } = this.props;
    const { from } = recordBase;
    const approveInfo = this.renderApprove();
    const NOT_LOGIN_HIDDEN_TYPES = [26, 27, 21, 48];

    return (
      <div
        className={cx('flex customFieldsWrapper h100', {
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
          disabled={workflow ? (from === 6 ? !isEditRecord : !recordInfo.allowEdit) : !isEditRecord}
          from={from === 21 ? from : recordBase.recordId && !isEditRecord ? 3 : 6}
          isDraft={isDraft || from === RECORD_INFO_FROM.DRAFT}
          flag={random.toString()}
          projectId={recordInfo.projectId}
          entityName={recordInfo.entityName}
          appId={recordBase.appId}
          worksheetId={recordBase.worksheetId}
          viewId={recordBase.viewId}
          recordId={recordBase.recordId}
          groupId={recordBase.groupId}
          rules={recordInfo.rules}
          controlProps={controlProps}
          registerCell={registerCell}
          isWorksheetQuery={recordInfo.isWorksheetQuery}
          recordCreateTime={recordInfo.createTime}
          view={view}
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
        />
      </div>
    );
  }

  renderRecordLock = () => {
    const { recordInfo, updateRecordLock = () => {} } = this.props;
    const { ruleItems = [] } = _.find(recordInfo.rules, r => r.type === 2) || {};
    const message = _.get(ruleItems, '0.message');
    return (
      <LockWrap>
        <div className="lockContent">
          <span className="lockIcon" onClick={updateRecordLock}>
            <Icon icon="lock" />
          </span>
          {message && <span className="Gray_75">{message}</span>}
        </div>
      </LockWrap>
    );
  };

  render() {
    const {
      isModal,
      isEditRecord,
      recordInfo,
      recordBase,
      formData,
      workflow,
      currentTab,
      payConfig = {},
      controlProps,
      isRecordLock,
      editLockedUser,
      updatePayConfig = () => {},
    } = this.props;
    const { entityName } = recordInfo;
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
          <PullToRefreshWrapper disabled={isEditRecord} onRefresh={controlProps.refreshRecord}>
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
                {isRecordLock && this.renderRecordLock()}
                {editLockedUser && (
                  <div className="flexRow alignItemsCenter mTop16">
                    <Icon icon="edit" className="Font15 ThemeColor" />
                    <div className="bold ThemeColor mLeft8">{editLockedUser.fullname + _l('编辑中···')}</div>
                  </div>
                )}
              </div>
            )}
            {/* 工作流获取支付链接要显示支付入口 */}
            {(!isEditRecord || _.get(window, 'shareState.isPublicWorkflowRecord')) && (
              <RecordPay
                projectId={recordInfo.projectId}
                appId={recordInfo.appId}
                worksheetId={recordBase.worksheetId}
                viewId={recordBase.viewId}
                rowId={recordBase.recordId}
                from={recordBase.from}
                sheetSwitchPermit={recordInfo.sheetSwitchPermit}
                payConfig={payConfig}
                isRecordLock={isRecordLock}
                entityName={recordInfo.entityName}
                onUpdateSuccess={updatePayConfig}
              />
            )}

            <div className="flex">{this.renderCustomFields()}</div>
            {!_.includes([29, 51], currentTab.type) && workflow && workflow({ formData })}
          </PullToRefreshWrapper>
        </div>
      </Fragment>
    );
  }
}
