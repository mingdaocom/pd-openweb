import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { Icon, PullToRefreshWrapper } from 'ming-ui';
import CustomFields from 'src/components/newCustomFields';
import { getTitleTextFromControls, controlState } from 'src/components/newCustomFields/tools/utils';
import SheetWorkflow from 'src/pages/workflow/components/SheetWorkflow';
import FormCover from 'worksheet/common/recordInfo/RecordForm/FormCover';
import DocumentTitle from 'react-document-title';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import * as actions from 'mobile/RelationRow/redux/actions';
import PayLog from 'src/pages/worksheet/components/DiscussLogFile/PayLog';
import { handlePrePayOrder } from 'src/pages/Admin/pay/PrePayorder';
import { selectUser } from 'src/pages/Mobile/components/SelectUser';
import { updateRecordOwner } from 'src/pages/worksheet/common/recordInfo/crtl.js';
import _ from 'lodash';
import { formatNumberThousand } from 'src/util';

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
      const { recordInfo, recordBase } = this.props;
    }

    // 兼容ios返回关闭确认支付弹层
    window.addEventListener('pagehide', () => {
      $('.mobilePayOrderDialog').parent().parent().remove();
    });
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
    if (tabsEl && tabsEl.offsetTop - 55 <= scrollTop && !workflow) {
      fixedTabsEl && fixedTabsEl.classList.remove('hide');
    } else {
      fixedTabsEl && fixedTabsEl.classList.add('hide');
    }
    if (view.viewType === 6 && view.childType === 1) {
      fixedTabsEl && fixedTabsEl.classList.add('top43');
    }
  };

  renderApprove = () => {
    const { isEditRecord, externalPortalConfig, recordInfo, recordBase, workflow, formData, payConfig } = this.props;
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
    if (payConfig.rowDetailIsShowOrder) {
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
      updateRecordDialogOwner = () => {},
    } = this.props;
    const { advancedSetting, formStyleImggeData, ownerAccount, allowEdit, projectId } = recordInfo;
    const { worksheetId, recordId, appId } = recordBase || {};

    if (isEditRecord) return;

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
      ownerControl &&
      controlState(ownerControl).editable &&
      recordBase.from !== RECORD_INFO_FROM.DRAFT &&
      !window.isPublicApp;

    if ((!formCoverVisible && isCoverid) || (formCoverVisible && !isCoverid)) {
      return;
    }

    const refreshRecordIcon = (
      <div className={cx('refreshWrap', { isLoading: refreshBtnNeedLoading })} onClick={controlProps.refreshRecord}>
        <Icon className="Font18" icon="task-later" />
      </div>
    );
    const sheetInfo = (
      <Fragment>
        {getDataType === 21 ? (
          <div className="sheetName ellipsis">{_l('编辑草稿')}</div>
        ) : (
          <div
            className="sheetName bold"
            onClick={() => {
              if (location.pathname.indexOf('public') > -1 || window.isPublicApp || md.global.Account.isPortal) return;
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
              if (!ownerEditable) return;
              selectUser({
                type: 'user',
                projectId,
                appId,
                onlyOne: true,
                userType: 3,
                filterAccountIds: [ownerAccount.accountId],
                includeUndefinedAndMySelf: true,
                onSave: async users => {
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
                    alert(_l('修改失败'), 2);
                  }
                },
              });
            }}
          >
            <span class="ellipsis">{_l('拥有者：%0', ownerAccount.fullname)}</span>
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
        </div>
      );
    }

    // 审批详情 header
    if (header) {
      return <div className="flexRow sheetNameWrap">{header}</div>;
    }

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
      isModal,
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

  // 支付
  handlePay = () => {
    const { recordBase, payConfig = {} } = this.props;
    const { worksheetId, recordId } = recordBase;

    if (payConfig.orderId) {
      location.href = `${md.global.Config.WebUrl}orderpay/${payConfig.orderId}`;
    } else {
      handlePrePayOrder({
        worksheetId,
        rowId: recordId,
        paymentModule: md.global.Account.isPortal ? 3 : 2,
        orderId: payConfig.orderId,
        onUpdateSuccess: updateObj => {},
      });
    }
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
    } = this.props;
    const { entityName, rules } = recordInfo;
    const recordTitle = getTitleTextFromControls(formData);
    const { isShowPay, payDescription, payAmount } = payConfig;

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
              </div>
            )}
            {!isEditRecord && isShowPay && (
              <div className="payWrap flexRow alignItemsCenter Bold" onClick={this.handlePay}>
                <div className="flex ellipsis mRight10 Font15">{payDescription}</div>
                <div className="Font15 mRight10">¥ {formatNumberThousand(payAmount)}</div>
                <div className="payBtn Font15">{_l('付款')}</div>
              </div>
            )}
            <div className="flex">{this.renderCustomFields()}</div>
            {!_.includes([29, 51], currentTab.type) && workflow && workflow({ formData })}
          </PullToRefreshWrapper>
        </div>
      </Fragment>
    );
  }
}
