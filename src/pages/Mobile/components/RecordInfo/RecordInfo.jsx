import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionSheet, Button } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, WaterMark } from 'ming-ui';
import externalPortalApi from 'src/api/externalPortal';
import paymentAjax from 'src/api/payment';
import worksheetApi from 'src/api/worksheet';
import ChatCount from 'mobile/components/ChatCount';
import * as actions from 'mobile/RelationRow/redux/actions';
import RelationAction from 'mobile/RelationRow/RelationAction';
import MobileRecordRecoverConfirm from 'worksheet/common/newRecord/MobileRecordRecoverConfirm';
import { handleSubmitDraft, loadRecord, updateRecord } from 'worksheet/common/recordInfo/crtl';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import {
  checkCellIsEmpty,
  emitter,
  filterHidedSubList,
  getRecordTempValue,
  getRowGetType,
  KVGet,
  removeTempRecordValueFromLocal,
  saveTempRecordValueToLocal,
} from 'worksheet/util';
import { replaceControlsTranslateInfo } from 'worksheet/util';
import { checkRuleLocked, updateRulesData } from 'src/components/newCustomFields/tools/formUtils';
import { controlState, formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getTranslateInfo } from 'src/util';
import RecordFooter from './RecordFooter';
import RecordForm from './RecordForm';
import { Abnormal, Loading } from './RecordState';
import './RecordInfo.less';

const imgAndVideoReg = /(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4|gif|png|jpg|jpeg|webp|svg|psd|bmp|tif|tiff)/i;

@connect(
  state => ({ ..._.pick(state.mobile, ['relationRow']) }),
  dispatch => bindActionCreators({ ..._.pick(actions, ['updateRelationRows']) }, dispatch),
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
      isEditRecord: false,
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
  customwidget = React.createRef();
  componentDidMount() {
    emitter.addListener('MOBILE_RELOAD_RECORD_INFO', this.debounceRefresh);
    this.loadRecord();
    if (
      this.props.getDataType !== 21 &&
      !this.isPublicShare &&
      !_.get(window, 'shareState.isPublicForm') &&
      !_.get(window, 'shareState.isPublicWorkflowRecord')
    ) {
      this.getPortalConfigSet();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentSheetRows } = nextProps;
    if (!_.isEmpty(currentSheetRows) && currentSheetRows !== this.props.currentSheetRows) {
      this.loadSwitchRecord(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    const { relationRow } = this.props;
    const { currentTab, isEditRecord, tempFormData = [] } = this.state;
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
    } else if (this.ignoreUpdateRelationCount && !_.isEqual(relationRow, prevProps.relationRow)) {
      this.ignoreUpdateRelationCount = false;
    }
  }

  refreshEvent = ({ worksheetId, recordId }) => {
    if (worksheetId === this.props.worksheetId && recordId === this.props.recordId) {
      this.refreshRecord();
    }
  };

  // 获取支付信息
  getPayConfig = (projectId, worksheetId, appId, rowId, viewId) => {
    return paymentAjax.checkPayOrderForRowDetail({
      projectId,
      worksheetId,
      appId,
      rowId,
      viewId,
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
      instanceId,
      workId,
      isWorksheetQuery,
      needUpdateControlIds,
      enablePayment,
      disableOpenRecordFromRelateRecord,
      currentSheetRows,
    } = this.props;
    const { recordId, tempFormData } = this.state;
    let { switchPermit } = this.state;

    try {
      const data = await loadRecord({
        appId,
        viewId,
        worksheetId,
        instanceId,
        workId,
        recordId,
        getType: getRowGetType(from),
        getRules: true,
        controls,
      });

      if (needReLoadSheetSwitch) {
        switchPermit = await worksheetApi.getSwitchPermit({ appId, worksheetId });
      }
      data.worksheetName = getTranslateInfo(appId, null, worksheetId).name || data.worksheetName;

      // 支付配置（草稿箱、对外公开分享\公开表单无支付）
      let payConfig =
        from === 21 ||
        this.isPublicShare ||
        _.get(window, 'shareState.isPublicForm') ||
        _.get(window, 'shareState.isPublicWorkflowRecord') ||
        (!_.isUndefined(enablePayment) && !enablePayment)
          ? {}
          : await this.getPayConfig(data.projectId, worksheetId, appId, recordId, viewId);

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

      const tempControls = needUpdateControlIds
        ? tempFormData
            .filter(c => !_.find(needUpdateControlIds, id => c.controlId === id))
            .concat(needUpdateControlIds.map(id => _.find(data.formData, c => c.controlId === id)).filter(_.identity))
        : data.formData;

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
      this.setState({
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
        },
        currentRecordIndex: _.findIndex(currentSheetRows, record => {
          return record && record.rowid === recordId;
        }),
        tempFormData: data.formData,
        loading: false,
        refreshBtnNeedLoading: false,
        payConfig,
        switchPermit,
      });
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
  refreshRecord = () => {
    if (this.state.isEditRecord || this.state.refreshBtnNeedLoading) {
      return;
    }
    const isPublicForm = _.get(window, 'shareState.isPublicForm') && window.shareState.shareId;
    this.setState({ refreshBtnNeedLoading: true }, () => this.loadRecord({ needReLoadSheetSwitch: false }));
    if (_.isFunction(this.refreshEvents.loadCustomBtns) && !isPublicForm) {
      this.refreshEvents.loadCustomBtns();
    }
    if (this.chatCountRef && this.chatCountRef.current) {
      this.chatCountRef.current.getDiscussionsCount();
    }
  };
  getPortalConfigSet() {
    const { appId } = this.props;
    externalPortalApi.getConfig({ appId }).then(res => {
      this.setState({
        externalPortalConfig: res,
      });
    });
  }
  handleFormChange = (data, ids = []) => {
    const { recordBase } = this.state;
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
    const { recordBase, recordInfo, tempFormData, formChanged } = this.state;
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
  handleSubmit = ({ callback, noSave, ignoreError, ignoreAlert = false, silent = false } = {}) => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.submitOptions = { callback, noSave, ignoreError };
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData({ ignoreAlert, silent });
  };

  // 保存记录后终止子表内请求
  abortChildTable = () => {
    Object.keys(this.cellObjs).forEach(key => {
      if (_.get(this, `cellObjs.${key}.cell.updateAbortController`)) {
        this.cellObjs[key].cell.updateAbortController();
      }
    });
  };

  handleCancelSave = () => {
    const { updateEditStatus = () => {} } = this.props;
    const { recordBase } = this.state;

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
    this.submitOptions = { ignoreError: draftType === 'save' };
    this.customwidget.current.submitFormData({
      ignoreAlert: true,
      ignoreError: draftType === 'save',
      verifyAllControls: draftType === 'submit',
    });
  };
  handleSave = (error, { data, updateControlIds }) => {
    const { allowEmptySubmit, updateEditStatus = () => {}, onClose = () => {} } = this.props;
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

    const { from, instanceId, workId, updateSuccess, workflow, updateDraftList, addNewRecord } = this.props;
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
        getType: isDraft ? undefined : getRowGetType(from),
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
      },
      (err, resdata, logId) => {
        this.setState({ submitLoading: false });
        if (!err) {
          const formData = tempFormData.map(c => _.assign({}, c, { value: resdata[c.controlId] }));
          updateEditStatus(false);
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
          if (_.isFunction(callback)) {
            callback({ logId });
          }
          if (!workflow) {
            this.loadRecord();
          }
          this.refreshSubList(data, updateControlIds);
          if (_.isFunction(this.refreshEvents.loadCustomBtns) && !isPublicForm) {
            this.refreshEvents.loadCustomBtns();
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
    const { getDataType, worksheetInfo = {}, updateEditStatus = () => {}, isDraft, from } = this.props;
    const { formChanged, isEditRecord, recordInfo, recordBase } = this.state;
    return (
      <RecordFooter
        isDraft={isDraft || from === RECORD_INFO_FROM.DRAFT}
        formChanged={formChanged}
        isEditRecord={isEditRecord}
        isPublicShare={this.isPublicShare}
        recordBase={recordBase}
        recordInfo={recordInfo}
        loadRecord={this.loadRecord}
        handleDeleteSuccess={this.handleDeleteSuccess}
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
    const { hideOtherOperate, footer, isDraft } = this.props;
    const { recordInfo = {}, recordBase, currentTab, isEditRecord, tempFormData } = this.state;
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
      return (
        <RelationAction
          isDraft={recordBase.from === RECORD_INFO_FROM.DRAFT || isDraft}
          controlId={currentTab.id}
          getDataType={this.props.getDataType}
          formData={tempFormData}
          rulesLocked={recordInfo.rulesLocked}
        />
      );
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
      this.loadRecord,
    );
  };

  handleDeleteSuccess = rowid => {
    const { isModal, onClose = () => {} } = this.props;
    if (isModal) {
      const { currentSheetRows = [], changeMobileSheetRows = () => {} } = this.props;
      changeMobileSheetRows(currentSheetRows.filter(r => r.rowid !== rowid));
      onClose();
    } else {
      window.history.back();
      this.loadRecord(); //兼容商家小票返回商家
    }
  };

  updateRecordOwner = (newOwner, record) => {
    const { recordId, recordInfo } = this.state;
    this.setState({ recordInfo: { ...recordInfo, ownerAccount: newOwner } });
  };

  renderSwitchRecord = () => {
    const { getDataType, isSubList, currentSheetRows = [], loadedRecordsOver } = this.props;
    const { isEditRecord, currentTab, currentRecordIndex, isNextRecord } = this.state;
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
    const {
      recordId,
      isModal,
      getDataType,
      onClose,
      renderAbnormal,
      header,
      workflow,
      relationRow,
      view,
      worksheetInfo,
      isDraft,
    } = this.props;
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
    } = this.state;

    if (loading || isSettingTempData) {
      return <Loading />;
    }

    if (abnormal) {
      if (renderAbnormal) {
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
            registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
            controlProps={{
              addRefreshEvents: (id, fn) => {
                this.refreshEvents[id] = fn;
              },
              refreshRecord: this.refreshRecord,
              updateRelationControls: (worksheetIdOfControl, newControls) => {
                this.customwidget.current.dataFormat.data = this.customwidget.current.dataFormat.data.map(item => {
                  if (item.type === 34 && item.dataSource === worksheetIdOfControl) {
                    return { ...item, relationControls: newControls };
                  } else {
                    return item;
                  }
                });
                this.customwidget.current.setState({ renderData: this.customwidget.current.getFilterDataByRule() });
              },
            }}
            changeMobileTab={tab => {
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
            updatePayConfig={obj => this.setState({ payConfig: { ...payConfig, ...obj } })}
            onClose={onClose}
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
                removeTempRecordValueFromLocal('recordInfo', recordBase.viewId + '-' + recordBase.recordId);
                this.setState({ restoreVisible: false });
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
