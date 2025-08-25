import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionSheet, Button } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, WaterMark } from 'ming-ui';
import externalPortalApi from 'src/api/externalPortal';
import paymentAjax from 'src/api/payment';
import worksheetApi from 'src/api/worksheet';
import ChatCount from 'mobile/components/ChatCount';
import * as actions from 'mobile/RelationRow/redux/actions';
import RelationAction from 'mobile/RelationRow/RelationAction';
import MobileRecordRecoverConfirm from 'worksheet/common/newRecord/MobileRecordRecoverConfirm';
import { handleSubmitDraft, loadRecord, updateRecord } from 'worksheet/common/recordInfo/crtl';
import { updateRecordLockStatus } from 'worksheet/common/recordInfo/crtl';
import RecordEditLock from 'worksheet/common/recordInfo/RecordEditLock';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { checkRuleLocked } from 'src/components/newCustomFields/tools/formUtils';
import { isPublicLink } from 'src/components/newCustomFields/tools/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getTranslateInfo } from 'src/utils/app';
import { emitter } from 'src/utils/common';
import { getRowGetType, KVGet, removeTempRecordValueFromLocal, saveTempRecordValueToLocal } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { getRecordTempValue } from 'src/utils/record';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import RecordFooter from './RecordFooter';
import RecordForm from './RecordForm';
import { Abnormal, Loading } from './RecordState';
import './RecordInfo.less';

const imgAndVideoReg = /(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4|gif|png|jpg|jpeg|webp|svg|psd|bmp|tif|tiff)/i;

@connect(
  state => ({ ..._.pick(state.mobile, ['relationRow']) }),
  dispatch => bindActionCreators({ ..._.pick(actions, ['updateRelationRows', 'updateActionParams']) }, dispatch),
)
export default class RecordInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      submitLoading: false,
      isSettingTempData: false,
      refreshBtnNeedLoading: false,
      formChanged: false,
      random: '',
      isEditRecord: props.isEditRecord || false,
      abnormal: false,
      recordInfo: {},
      recordBase: {},
      tempFormData: [],
      externalPortalConfig: {},
      recordId: props.recordId,
      currentTab: {},
      restoreVisible: false,
      payConfig: {}, // 支付相关
      currentRecordIndex: 0, //  当前记录在列表中第几条
      isRecordLock: false, // 记录是否锁定
      editLockedUser: null,
    };
    this.submitType = '';
    this.refreshEvents = {};
    this.cellObjs = {};
    this.confirmHandler = null;
    this.debounceRefresh = _.debounce(this.refreshEvent, 1000);
    this.draftType = 'save'; // save: 保存  submit: 提交,
    this.chatCountRef = createRef();
  }
  get isPublicShare() {
    return (
      _.get(window, 'shareState.isPublicRecord') ||
      _.get(window, 'shareState.isPublicView') ||
      _.get(window, 'shareState.isPublicPage') ||
      _.get(window, 'shareState.isPublicQuery') ||
      _.get(window, 'shareState.isPublicPrint')
    );
  }

  get discussId() {
    const url = new URL(location.href);
    const discussId = url.searchParams.get('inboxId');
    if (!this.props.isModal && discussId) {
      return discussId;
    }
    return undefined;
  }

  customwidget = React.createRef();
  componentDidMount() {
    emitter.addListener('MOBILE_RELOAD_RECORD_INFO', this.debounceRefresh);
    this.loadRecord();
    this.getPayConfig();
  }

  componentDidUpdate(prevProps) {
    const { relationRow } = this.props;
    const { currentTab, isEditRecord } = this.state;
    if (
      this.customwidget &&
      this.customwidget.current &&
      currentTab.type === 29 &&
      !_.isEqual(relationRow, prevProps.relationRow) &&
      (!this.ignoreUpdateRelationCount || isEditRecord)
    ) {
      this.customwidget.current.handleChange(
        !_.isNaN(relationRow.count) ? relationRow.count : currentTab.value,
        currentTab.controlId,
        currentTab,
      );
      this.setState({
        currentTab: {
          ...currentTab,
          value: !_.isNaN(relationRow.count) ? relationRow.count : currentTab.value,
        },
      });
    } else if (this.ignoreUpdateRelationCount && !_.isEqual(relationRow, prevProps.relationRow)) {
      this.ignoreUpdateRelationCount = false;
    }
  }

  componentWillUnmount() {
    this.recordEditLock?.destroy();
  }

  getIsEditLockOpen = recordInfo => {
    const { from } = this.props;
    const featureType = getFeatureStatus(recordInfo.projectId, VersionProductType.editProtect);
    const rowEditLock = safeParse(_.get(recordInfo, 'advancedSetting.roweditlock')) || {};

    return (
      featureType === '1' &&
      from !== RECORD_INFO_FROM.DRAFT &&
      !_.get(window, 'shareState.isPublicForm') &&
      recordInfo.allowEdit &&
      rowEditLock.isopen === '1'
    );
  };

  refreshEvent = ({ worksheetId, recordId }) => {
    if (worksheetId === this.props.worksheetId && recordId === this.props.recordId) {
      this.refreshRecord();
    }
  };

  // 获取支付信息
  getPayConfig = () => {
    const { worksheetId, viewId, enablePayment, from } = this.props;
    const { recordId } = this.state;
    if (!((enablePayment || location.search.includes('payshare=true')) && from !== 21)) return;
    paymentAjax
      .checkPayOrderForRowDetail({
        worksheetId,
        rowId: recordId,
        viewId,
        isOtherPayment: location.search.includes('payshare=true'),
      })
      .then(res => {
        this.setState({ payConfig: res, random: Date.now() });
      });
  };

  loadRecord = async ({ needReLoadSheetSwitch = true } = {}) => {
    const {
      from,
      view = {},
      controls,
      appId,
      viewId,
      worksheetId,
      relationWorksheetId,
      instanceId,
      workId,
      isWorksheetQuery,
      disableOpenRecordFromRelateRecord,
      currentSheetRows,
      isCharge,
      isRelateRecord,
    } = this.props;
    const { recordId } = this.state;
    let { switchPermit } = this.state;

    try {
      const data = await loadRecord({
        appId,
        viewId,
        worksheetId,
        instanceId,
        workId,
        recordId,
        getType: !isRelateRecord && getRowGetType(from, { discussId: !!this.discussId }),
        getRules: true,
        controls,
        relationWorksheetId,
        discussId: this.discussId,
      });
      if (needReLoadSheetSwitch) {
        switchPermit = await worksheetApi.getSwitchPermit({ appId, worksheetId });
      }
      data.worksheetName = getTranslateInfo(appId, null, worksheetId).name || data.worksheetName;

      // 设置隐藏字段的 hidden 属性
      data.formData = replaceControlsTranslateInfo(appId, worksheetId, data.formData)
        .filter(c => c.controlId !== 'daid')
        .map(c => {
          if (disableOpenRecordFromRelateRecord) {
            try {
              c.advancedSetting.allowlink = '0';
            } catch (err) {
              console.error(err);
            }
          }
          return {
            ...c,
            hidden: c.hidden || (view.controls || _.get(data, 'view.controls') || []).includes(c.controlId),
          };
        });

      // 封面配置
      const { coverid } = data.advancedSetting;
      const formStyleControl = _.find(data.formData, i => i.controlId === coverid) || {};
      const recordInfo = {
        ...data,
        switchPermit,
        isWorksheetQuery: isWorksheetQuery || _.isUndefined(isWorksheetQuery),
        formStyleImggeData: coverid
          ? JSON.parse(formStyleControl.value || '[]').filter(i => imgAndVideoReg.test(i.ext))
          : [],
        rulesLocked: checkRuleLocked(data.rules, data.formData, recordId),
      };
      if (_.get(window, 'shareState.shareId') || window.shareAuthor) {
        recordInfo.allowEdit = false;
        recordInfo.allowDelete = false;
      }

      if (this.getIsEditLockOpen(recordInfo)) {
        if (this.recordEditLock) {
          this.recordEditLock.destroy();
          this.recordEditLock.checkAndLock.cancel();
        }

        this.recordEditLock = new RecordEditLock({
          worksheetId,
          recordId,
          rowEditLock: safeParse(_.get(recordInfo, 'advancedSetting.roweditlock')) || {},
          updateLockedUser: userInfo => this.setState({ editLockedUser: userInfo }),
          onLockCallBack: () => this.handleCancelSave(),
          onRefreshRecord: () => this.handleCancelSave(this.refreshRecord),
        });
      }

      this.setState(
        {
          editLockedUser: this.recordEditLock?.lockData.lockAccount,
          random: Date.now(),
          recordInfo,
          recordBase: {
            from,
            appId: _.isUndefined(appId) ? recordInfo.appId : appId,
            worksheetId,
            viewId,
            instanceId,
            workId,
            recordId,
            isCharge,
          },
          currentRecordIndex: _.findIndex(currentSheetRows, record => {
            return record && record.rowid === recordId;
          }),
          tempFormData: data.formData,
          loading: false,
          refreshBtnNeedLoading: false,
          switchPermit,
          isRecordLock: data.isLock,
        },
        () => {
          this.getPortalConfigSet();
          if (_.isFunction(this.props.updateRow) && !data.isViewData && _.isFunction(this.props.onClose)) {
            const rowData = safeParse(data.rowData);
            this.props.updateRow(recordId, _.omit(rowData, ['allowedit', 'allowdelete']), rowData.isviewdata);
            this.props.onClose();
          }
        },
      );
    } catch (err) {
      console.error(err);
      this.setState({
        recordInfo: err,
        abnormal: true,
        loading: false,
        refreshBtnNeedLoading: false,
      });
    }
  };

  updateRecordLock = () => {
    const { recordInfo } = this.state;
    if (recordInfo?.roleType === 2 && !isPublicLink()) {
      updateRecordLockStatus(
        {
          ..._.pick(this.props, ['appId', 'viewId', 'worksheetId', 'recordId']),
          updateType: this.state.isRecordLock ? 42 : 41,
        },
        (err, resdata) => {
          if (resdata) {
            this.setState({ isRecordLock: resdata.sys_lock });
            const entityName = recordInfo.entityName || _l('记录');
            if (resdata.sys_lock) {
              alert(_l('%0锁定成功', entityName));
            } else {
              alert(_l('%0已解锁', entityName));
            }
          }
        },
      );
    }
  };

  refreshRecord = () => {
    if (this.state.isEditRecord || this.state.refreshBtnNeedLoading) {
      return;
    }
    const isPublicForm = _.get(window, 'shareState.isPublicForm') && window.shareState.shareId;
    this.setState({ refreshBtnNeedLoading: true }, () => {
      this.loadRecord({ needReLoadSheetSwitch: false });
      this.getPayConfig();
    });
    if (_.isFunction(this.refreshEvents.loadCustomBtns) && !isPublicForm) {
      this.refreshEvents.loadCustomBtns();
    }
    if (this.chatCountRef && this.chatCountRef.current) {
      this.chatCountRef.current.getDiscussionsCount();
    }
  };
  getPortalConfigSet = async () => {
    const { appId, getDataType } = this.props;
    const { recordInfo, recordBase } = this.state;
    const { viewId } = recordBase;
    const { switchPermit } = recordInfo;
    let portalConfigSet = {};
    const { id: windowAppId, portalConfig = {} } = window?.appInfo || {};
    const isSameApp = appId === windowAppId;
    const isPublic =
      this.isPublicShare ||
      _.get(window, 'shareState.isPublicForm') ||
      _.get(window, 'shareState.isPublicWorkflowRecord');
    if (isSameApp) {
      portalConfigSet = portalConfig;
    } else if (!isPublic && getDataType !== 21) {
      const showDiscuss = isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId);
      const showApprove = isOpenPermit(permitList.approveDetailsSwitch, switchPermit, viewId);
      if (showDiscuss || showApprove) {
        // 非同一个应用且讨论或审批没有关闭 去获取外部门户讨论设置
        try {
          portalConfigSet = await externalPortalApi.getConfig({ appId });
        } catch (e) {
          console.log(e);
        }
      }
    }
    portalConfigSet.allowExAccountDiscuss = portalConfigSet.allowExAccountDiscuss && portalConfigSet.isEnable;
    this.setState({
      externalPortalConfig: portalConfigSet,
    });
  };
  handleFormChange = (data, ids = []) => {
    const { recordBase } = this.state;

    if (this.recordEditLock && !this.recordEditLock.checkAndLock()) {
      return;
    }

    this.setState({ formChanged: true });
    const { viewId, recordId } = recordBase;
    if (viewId) {
      const tempRecordValue = getRecordTempValue(data, undefined, { updateControlIds: ids });
      saveTempRecordValueToLocal(
        'recordInfo',
        viewId + '-' + recordId,
        JSON.stringify({ create_at: Date.now(), value: tempRecordValue }),
      );
    }
  };

  loadTempValue = updateTime => {
    const { recordBase, tempFormData, formChanged } = this.state;
    const { recordId, viewId } = recordBase;
    if (!viewId) return;
    let tempData;
    const handleFillValue = () => {
      if (tempData && !formChanged) {
        const savedData = safeParse(tempData);
        if (_.isEmpty(savedData)) return;
        this.setState({ isSettingTempData: true });
        const { create_at, value } = savedData;
        const tempRecordCreateTime = new Date(create_at);
        const recordUpdateTime = new Date(updateTime);
        if (tempRecordCreateTime > recordUpdateTime) {
          const newTempData = tempFormData.map(c =>
            typeof value[c.controlId] !== 'undefined' && !((c.type === 29 && c.enumDefault !== 1) || c.type === 34)
              ? {
                  ...c,
                  value:
                    c.type === 34
                      ? {
                          // action: 'clearAndSet',con
                          rows: value[c.controlId],
                        }
                      : value[c.controlId],
                }
              : c,
          );
          if (
            _.isEmpty(
              newTempData.filter(
                c =>
                  typeof value[c.controlId] !== 'undefined' &&
                  !((c.type === 29 && c.enumDefault !== 1) || c.type === 34),
              ),
            )
          ) {
            this.setState({ isSettingTempData: false });
            return;
          }
          this.setState(
            {
              isSettingTempData: false,
              restoreVisible: tempRecordCreateTime,
              tempFormData: tempFormData.map(c =>
                typeof value[c.controlId] !== 'undefined' && !((c.type === 29 && c.enumDefault !== 1) || c.type === 34)
                  ? {
                      ...c,
                      value:
                        c.type === 34
                          ? {
                              rows: value[c.controlId],
                            }
                          : value[c.controlId],
                    }
                  : c,
              ),
              random: Date.now(),
            },
            () => {},
          );
          setTimeout(() => {
            this.customwidget.current.dataFormat.controlIds = tempFormData
              .filter(c => value[c.controlId] && !((c.type === 29 && c.enumDefault !== 1) || c.type === 34))
              .map(c => c.controlId);
          }, 300);
        } else {
          this.setState({ isSettingTempData: false });
        }
      }
    };

    if (window.isWxWork) {
      KVGet(`${md.global.Account.accountId}${viewId}-${recordId}-recordInfo`).then(data => {
        tempData = data;
        handleFillValue();
      });
    } else {
      tempData = localStorage.getItem(`recordInfo_${viewId}-${recordId}`);
      handleFillValue();
    }
  };
  handleSubmit = ({
    callback,
    noSave,
    ignoreError,
    ignoreAlert = false,
    silent = false,
    ignoreDialog = false,
  } = {}) => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.submitOptions = { callback, noSave, ignoreError };
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData({ ignoreAlert, silent, ignoreDialog });
  };

  // 保存记录后终止子表内请求
  abortChildTable = () => {
    Object.keys(this.cellObjs).forEach(key => {
      if (_.get(this, `cellObjs.${key}.cell.updateAbortController`)) {
        this.cellObjs[key].cell.updateAbortController();
      }
    });
  };

  handleCancelSave = (cb = () => {}) => {
    const { updateEditStatus = () => {} } = this.props;
    const { recordBase } = this.state;

    this.recordEditLock?.cancelEditLock();

    this.confirmHandler && this.confirmHandler.close();
    removeTempRecordValueFromLocal('recordInfo', recordBase.viewId + '-' + recordBase.recordId);
    updateEditStatus(false);
    this.setState(
      {
        formChanged: false,
        isEditRecord: false,
        random: Date.now(),
      },
      () => {
        this.customwidget.current.dataFormat.callStore('cancelChange');
        this.abortChildTable();
        _.isFunction(cb) && cb();
      },
    );
  };
  handleTriggerSave = ({ draftType } = {}) => {
    this.draftType = draftType;
    this.confirmHandler && this.confirmHandler.close();
    this.setState({
      formChanged: false,
      submitLoading: true,
    });
    const isDraftSave = draftType === 'save';
    this.submitOptions = { ignoreError: isDraftSave };
    this.customwidget.current.submitFormData({
      ignoreAlert: isDraftSave,
      ignoreError: isDraftSave,
      ignoreDialog: isDraftSave,
    });
  };
  handleSave = (error, { data, updateControlIds }) => {
    const {
      allowEmptySubmit,
      isRelateRecord,
      updateEditStatus = () => {},
      onClose = () => {},
      updateRow = () => {},
    } = this.props;
    const { callback = () => {}, noSave, ignoreError } = this.submitOptions || {};
    const { recordInfo, recordBase, tempFormData } = this.state;
    const isPublicForm = _.get(window, 'shareState.isPublicForm') && window.shareState.shareId;

    if (error && !ignoreError) {
      callback({ error: true });
      this.setState({ submitLoading: false });
      return;
    }

    let hasError;
    if (hasError && !ignoreError) {
      alert(_l('请正确填写%0', recordInfo.entityName), 3);
      callback({ error: true });
      this.setState({ submitLoading: false });
      return;
    }

    if (noSave) {
      this.setState({ submitLoading: false });
      callback();
      return;
    }

    const { from, instanceId, workId, updateSuccess, workflow, updateDraftList, addNewRecord, updateRelateRecord } =
      this.props;
    this.abortChildTable();
    const isDraft = from === RECORD_INFO_FROM.DRAFT;

    if (isDraft && this.draftType === 'submit') {
      // 提交草稿（转为正常记录）
      handleSubmitDraft(
        {
          formData: data,
          appId: recordBase.appId,
          worksheetId: recordBase.worksheetId,
          viewId: recordBase.viewId,
          recordId: recordBase.recordId,
          rules: _.get(this.props, 'worksheetInfo.rules'),
          triggerUniqueError: badData => {
            if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
              this.customwidget.current.uniqueErrorUpdate(badData);
            }
          },
          onSubmitEnd: () => {
            this.setState({ submitLoading: false });
            onClose();
          },
          onSubmitSuccess: rowData => {
            // 更新草稿列表
            if (_.isFunction(updateDraftList)) {
              updateDraftList(recordBase.recordId);
            } else if (location.pathname.includes('mobile/record')) {
              // 新开页提交成功后刷新成正常记录
              location.href = `${location.origin}/mobile/record/${recordBase.appId}/${recordBase.worksheetId}/${rowData.rowid}`;
            }
            // 更新记录列表
            if (_.isFunction(addNewRecord)) {
              addNewRecord(rowData);
            }
          },
        },
        err => {
          setTimeout(() => {
            this.setState({
              submitLoading: false,
            });
          }, 600);
          if (err) {
            callback({ error: err });
          }
        },
      );
      return;
    }

    updateRecord(
      {
        appId: recordBase.appId,
        worksheetId: recordBase.worksheetId,
        viewId: recordBase.viewId,
        recordId: recordBase.recordId,
        getType: isDraft || isRelateRecord ? undefined : getRowGetType(from, { discussId: !!this.discussId }),
        projectId: recordInfo.projectId,
        instanceId,
        workId,
        data,
        updateControlIds,
        updateSuccess,
        isDraft,
        allowEmptySubmit,
        draftType: this.draftType,
        triggerUniqueError: badData => {
          if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
            this.customwidget.current.uniqueErrorUpdate(badData);
          }
        },
        alertLockError: () => {
          alert(_l('记录已锁定，无法保存'), 3);
        },
      },
      (err, resdata, logId) => {
        this.setState({ submitLoading: false });
        if (!err) {
          const formData = tempFormData.map(c => _.assign({}, c, { value: resdata[c.controlId] }));
          updateRow(recordBase.recordId, _.omit(resdata, ['allowedit', 'allowdelete']), resdata.isviewdata);
          updateEditStatus(false);
          updateRelateRecord && updateRelateRecord(formData);
          // 更新草稿列表
          if (_.isFunction(updateDraftList)) {
            updateDraftList(recordBase.recordId, Object.assign(recordInfo, { formData }));
          }
          this.setState({
            isEditRecord: false,
            random: Date.now(),
            recordInfo: Object.assign(recordInfo, { formData }),
            tempFormData: formData,
          });
          this.recordEditLock?.cancelEditLock();
          if (_.isFunction(callback)) {
            callback({ logId });
          }
          if (!workflow) {
            this.loadRecord();
            this.getPayConfig();
          }
          this.refreshSubList(data, updateControlIds);
          if (_.isFunction(this.refreshEvents.loadCustomBtns) && !isPublicForm) {
            this.refreshEvents.loadCustomBtns();
          }
          if (!resdata.isviewdata && _.isFunction(onClose)) {
            onClose();
          }
        } else {
          callback({ error: err });
        }
      },
    );
  };
  refreshSubList = (tempFormData, updateControlIds) => {
    tempFormData
      .filter(c => _.find(updateControlIds, id => c.controlId === id))
      .forEach(c => {
        if (_.isFunction(this.refreshEvents[c.controlId])) {
          this.refreshEvents[c.controlId]({ noLoading: true });
        }
      });
  };
  renderRecordBtns() {
    const {
      getDataType,
      worksheetInfo = {},
      updateEditStatus = () => {},
      isDraft,
      from,
      instanceId,
      workId,
    } = this.props;
    const { formChanged, isEditRecord, recordInfo, recordBase, isRecordLock, editLockedUser, tempFormData } =
      this.state;

    return (
      <RecordFooter
        isDraft={isDraft || from === RECORD_INFO_FROM.DRAFT}
        formChanged={formChanged}
        isEditRecord={isEditRecord}
        isPublicShare={this.isPublicShare}
        recordBase={recordBase}
        editLockedUser={editLockedUser}
        recordInfo={recordInfo}
        workId={workId}
        instanceId={instanceId}
        formData={tempFormData}
        loadRecord={() => {
          this.loadRecord();
          this.getPayConfig();
        }}
        handleDeleteSuccess={this.handleDeleteSuccess}
        isRecordLock={isRecordLock}
        updateRecordLock={this.updateRecordLock}
        addRefreshEvents={(key, fn) => {
          this.refreshEvents[key] = fn;
        }}
        onEditRecord={() => {
          updateEditStatus(true);
          this.setState(
            {
              isEditRecord: true,
              random: Date.now(),
            },
            () => {
              this.loadTempValue(recordInfo.updateTime);
            },
          );
        }}
        onSubmitRecord={() => {
          if (window.isPublicApp) {
            alert(_l('预览模式下，不能操作'), 3);
            return;
          }
          const doubleConfirm = safeParse(_.get(worksheetInfo, 'advancedSetting.doubleconfirm'));
          if (_.get(worksheetInfo, 'advancedSetting.enableconfirm') === '1') {
            // 提交二次确认
            let actionHandler = ActionSheet.show({
              actions: [],
              extra: (
                <div className="flexColumn w100">
                  <div className="Font17 Gray bold pTop10 mBottom10 TxtLeft breakAll">{doubleConfirm.confirmMsg}</div>
                  <div className="Gray_9e breakAll">{doubleConfirm.confirmContent}</div>
                  <div className="valignWrapper flexRow confirm mTop15">
                    <Button
                      className="flex mLeft6 mRight6 Font13 bold Gray_75 flex ellipsis"
                      onClick={() => {
                        actionHandler.close();
                      }}
                    >
                      {doubleConfirm.cancelName}
                    </Button>
                    <Button
                      className="flex mLeft6 mRight6 Font13 bold flex ellipsis"
                      color="primary"
                      onClick={() => {
                        this.handleTriggerSave({ draftType: 'submit' });
                        actionHandler.close();
                      }}
                    >
                      {doubleConfirm.sureName}
                    </Button>
                  </div>
                </div>
              ),
            });
          } else {
            this.handleTriggerSave({ draftType: 'submit' });
          }
        }}
        onCancelSave={() => {
          if (this.state.formChanged) {
            this.confirmHandler = ActionSheet.show({
              popupClassName: 'md-adm-actionSheet',
              actions: [],
              extra: (
                <div className="flexColumn w100">
                  <div className="bold Gray Font17 pTop10">{_l('是否保存修改的记录 ?')}</div>
                  <div className="valignWrapper flexRow confirm mTop24">
                    <Button className="flex mRight6 bold Gray_75 flex ellipsis Font13" onClick={this.handleCancelSave}>
                      {_l('放弃')}
                    </Button>
                    <Button
                      className="flex mLeft6 bold flex ellipsis Font13"
                      color="primary"
                      onClick={() => this.handleTriggerSave(getDataType === 21 ? { draftType: 'save' } : undefined)}
                    >
                      {_l('保存')}
                    </Button>
                  </div>
                </div>
              ),
            });
          } else {
            this.handleCancelSave();
          }
        }}
        onSaveRecord={() => {
          if (window.isPublicApp) {
            alert(_l('预览模式下，不能操作'), 3);
            return;
          }
          this.handleTriggerSave(getDataType === 21 ? { draftType: 'save' } : undefined);
        }}
        {...this.props}
      />
    );
  }
  renderFooter() {
    const { footer, isDraft } = this.props;
    const {
      recordInfo = {},
      recordBase,
      currentTab,
      isEditRecord,
      tempFormData,
      editLockedUser,
      isRecordLock,
    } = this.state;

    if (_.isFunction(this.props.renderFooter)) {
      return (
        <div className="flexRow alignItemsCenter WhiteBG pAll10 footer">
          {this.props.renderFooter({ onSubmit: this.handleSubmit })}
        </div>
      );
    }

    if (footer && !recordBase.viewId) {
      return React.cloneElement(footer, {
        onSubmit: this.handleSubmit,
        handleClickFlow: () => this.setState({ random: Date.now() }),
      });
    }
    if (this.isPublicShare || (currentTab.type === 51 && !isEditRecord) || ['approve', 'pay'].includes(currentTab.id)) {
      return null;
    }
    if (currentTab.type === 29 && !isEditRecord) {
      return !editLockedUser ? (
        <RelationAction
          isDraft={recordBase.from === RECORD_INFO_FROM.DRAFT || isDraft}
          controlId={currentTab.id}
          getDataType={this.props.getDataType}
          formData={tempFormData}
          rulesLocked={recordInfo.rulesLocked}
          isRecordLock={isRecordLock}
        />
      ) : null;
    }
    return this.renderRecordBtns();
  }
  renderChatCount() {
    const { isEditRecord, currentTab, externalPortalConfig, recordBase, recordInfo, tempFormData } = this.state;
    const { getDataType, isModal, isSubList, chartEntryStyle = {}, canLoadSwitchRecord, workId } = this.props;
    const { allowExAccountDiscuss, exAccountDiscussEnum } = externalPortalConfig;
    const { appId, worksheetId, viewId, recordId } = recordBase;
    const { switchPermit } = recordInfo;

    const discussVisible = isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId);
    const logVisible = isOpenPermit(permitList.recordLogSwitch, switchPermit, viewId);

    const isPublicShare =
      this.isPublicShare ||
      _.get(window, 'shareState.isPublicForm') ||
      _.get(window, 'shareState.isPublicWorkflowRecord');

    const open =
      (!isPublicShare && !md.global.Account.isPortal && (discussVisible || logVisible)) ||
      (md.global.Account.isPortal && allowExAccountDiscuss && discussVisible);
    const showChatMessage = (!getDataType || getDataType !== 21) && open && !isEditRecord && !isSubList;
    const showSwitchRecordEntry = canLoadSwitchRecord && !_.includes(['approve', 'pay'], currentTab.id);

    if (showChatMessage || showSwitchRecordEntry) {
      return (
        <div
          className="extraAction flexRow"
          style={{
            bottom: _.includes(['approve', 'pay'], currentTab.id) && !workId ? 13 : undefined,
            ...chartEntryStyle,
          }}
        >
          {showSwitchRecordEntry && this.renderSwitchRecord()}
          {showChatMessage && (
            <div className="chatMessageContainer mLeft10">
              <ChatCount
                ref={this.chatCountRef}
                allowExAccountDiscuss={allowExAccountDiscuss}
                exAccountDiscussEnum={exAccountDiscussEnum}
                formData={tempFormData}
                recordDiscussSwitch={isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId)}
                recordLogSwitch={isOpenPermit(permitList.recordLogSwitch, switchPermit, viewId)}
                worksheetId={worksheetId}
                rowId={recordId}
                viewId={viewId}
                appId={appId}
                autoOpenDiscuss={!isModal && location.search.includes('viewDiscuss')}
                originalData={recordInfo.formData}
                projectId={recordInfo.projectId}
              />
            </div>
          )}
        </div>
      );
    }
  }

  loadSwitchRecord = props => {
    const { currentSheetRows = [], loadNextPageRecords = () => {}, loadedRecordsOver } = props || this.props;
    const { recordId, loading, isNextRecord } = this.state;

    if (loading || _.isEmpty(currentSheetRows)) return;

    const index = _.findIndex(currentSheetRows, record => {
      return record && record.rowid === recordId;
    });
    const newIndex = isNextRecord ? index + 1 : index - 1;
    if (!currentSheetRows[newIndex]) {
      if (!loadedRecordsOver && currentSheetRows.length >= 20) {
        loadNextPageRecords();
      } else {
        this.setState({ currentRecordIndex: index });
      }
      return;
    }
    const newRecordId = currentSheetRows[newIndex].rowid;

    this.setState(
      {
        recordId: newRecordId,
        loading: true,
        currentRecordIndex: _.findIndex(currentSheetRows, record => {
          return record && record.rowid === newRecordId;
        }),
      },
      () => {
        this.loadRecord();
        this.getPayConfig();
      },
    );
  };

  handleDeleteSuccess = rowid => {
    const { isModal, onClose = () => {}, deleteRow, deleteCallback = () => {} } = this.props;
    if (isModal) {
      const { currentSheetRows = [], changeMobileSheetRows = () => {} } = this.props;
      changeMobileSheetRows(currentSheetRows.filter(r => r.rowid !== rowid));
      if (deleteRow) deleteRow(rowid);
      deleteCallback(rowid);
      onClose();
    } else {
      window.history.back();
      this.loadRecord(); //兼容商家小票返回商家
    }
  };

  updateRecordOwner = newOwner => {
    const { recordInfo } = this.state;
    this.setState({ recordInfo: { ...recordInfo, ownerAccount: newOwner } });
  };

  renderSwitchRecord = () => {
    const { getDataType, isSubList, currentSheetRows = [], loadedRecordsOver } = this.props;
    const { isEditRecord, currentTab, currentRecordIndex } = this.state;
    if (
      getDataType === 21 ||
      isEditRecord ||
      isSubList ||
      _.isEmpty(currentSheetRows) ||
      _.includes(['approve', 'pay'], currentTab.id) ||
      _.includes([29, 51], currentTab.type)
    )
      return null;

    const needLoad = !loadedRecordsOver && currentSheetRows.length >= 20;
    const hidePre = !needLoad && !currentSheetRows[currentRecordIndex - 1];
    const hideNext = !needLoad && !currentSheetRows[currentRecordIndex + 1];

    return (
      <Fragment>
        {!hidePre && (
          <div
            className="switchRecordEntryWrap"
            onClick={() => this.setState({ isNextRecord: false }, this.loadSwitchRecord)}
          >
            <i className="icon icon-arrow-up-border Font20 LineHeight40" />
          </div>
        )}
        {!hideNext && (
          <div
            className="switchRecordEntryWrap mLeft10"
            onClick={() => this.setState({ isNextRecord: true }, this.loadSwitchRecord)}
          >
            <i className="icon icon-arrow-down-border Font20 LineHeight42" />
          </div>
        )}
      </Fragment>
    );
  };
  render() {
    const { recordId, isModal, getDataType, onClose, renderAbnormal, header, workflow, view, worksheetInfo, isDraft } =
      this.props;
    const {
      random,
      isEditRecord,
      loading,
      isSettingTempData,
      submitLoading,
      refreshBtnNeedLoading,
      abnormal,
      restoreVisible,
      recordInfo,
      recordBase,
      tempFormData,
      currentTab,
      externalPortalConfig,
      payConfig,
      isRecordLock,
      editLockedUser,
    } = this.state;

    if (loading || isSettingTempData) {
      return <Loading />;
    }

    if (abnormal) {
      if (renderAbnormal && recordInfo.resultCode === 7) {
        return renderAbnormal(recordInfo);
      } else {
        const { resultCode, entityName } = recordInfo;
        const name = entityName || _l('记录');
        const errorMsg = resultCode === 7 ? _l('无权限查看%0', name) : _l('%0已被删除或分享已关闭', name);
        return <Abnormal errorMsg={errorMsg} onClose={onClose} />;
      }
    }

    const useWaterMark = !isModal && recordInfo.projectId;
    const Wrap = useWaterMark ? WaterMark : React.Fragment;

    return (
      <Wrap {...(useWaterMark ? { projectId: recordInfo.projectId } : {})}>
        <div className={cx('recordInfoForm mobileSheetRowRecord flexColumn h100', `mobileSheetRowRecord-${recordId}`)}>
          {submitLoading && (
            <div className="loadingMask">
              <LoadDiv />
            </div>
          )}
          <RecordForm
            view={view}
            customwidget={this.customwidget}
            isPublicShare={this.isPublicShare}
            random={random}
            isEditRecord={isEditRecord}
            isModal={isModal}
            refreshBtnNeedLoading={refreshBtnNeedLoading}
            recordBase={recordBase}
            editLockedUser={editLockedUser}
            registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
            controlProps={{
              discussId: this.discussId,
              addRefreshEvents: (id, fn) => {
                this.refreshEvents[id] = fn;
              },
              refreshRecord: this.refreshRecord,
              updateRelationControls: (controlId, newControls) => {
                this.customwidget.current.dataFormat.data = this.customwidget.current.dataFormat.data.map(item => {
                  if (item.type === 34 && item.controlId === controlId) {
                    return { ...item, relationControls: newControls };
                  } else {
                    return item;
                  }
                });
                this.customwidget.current.getFilterDataByRule();
              },
            }}
            changeMobileTab={tab => {
              this.props.updateActionParams({
                isEdit: false,
                selectedRecordIds: [],
              });
              if (isEditRecord) {
                this.props.updateRelationRows([], 0);
              }
              this.ignoreUpdateRelationCount = !isEditRecord;
              this.setState({ currentTab: { id: tab.controlId, ...tab } });
            }}
            externalPortalConfig={externalPortalConfig}
            recordInfo={recordInfo}
            formData={tempFormData}
            getDataType={getDataType}
            currentTab={currentTab}
            header={header}
            workflow={workflow}
            payConfig={payConfig}
            worksheetInfo={worksheetInfo}
            isDraft={recordBase.from === RECORD_INFO_FROM.DRAFT || isDraft}
            onChange={this.handleFormChange}
            onSave={this.handleSave}
            updateRecordDialogOwner={this.updateRecordOwner}
            updatePayConfig={this.getPayConfig}
            onClose={onClose}
            isRecordLock={isRecordLock}
            updateRecordLock={this.updateRecordLock}
          />
          {this.renderFooter()}
          {this.renderChatCount()}
          {isEditRecord && (
            <MobileRecordRecoverConfirm
              visible={restoreVisible}
              title={
                restoreVisible
                  ? _l('已恢复到上次中断内容（%0）', window.createTimeSpan(new Date(restoreVisible)))
                  : _l('已恢复到上次中断内容')
              }
              updateText={_l('确认')}
              cancelText={_l('取消')}
              onUpdate={() => {
                if (!this.recordEditLock || this.recordEditLock?.checkAndLock()) {
                  removeTempRecordValueFromLocal('recordInfo', recordBase.viewId + '-' + recordBase.recordId);
                  this.setState({ restoreVisible: false });
                }
              }}
              onCancel={() => {
                removeTempRecordValueFromLocal('recordInfo', recordBase.viewId + '-' + recordBase.recordId);
                this.setState({
                  restoreVisible: false,
                  tempFormData: recordInfo.formData || [],
                  random: Date.now(),
                });
              }}
            />
          )}
        </div>
      </Wrap>
    );
  }
}
