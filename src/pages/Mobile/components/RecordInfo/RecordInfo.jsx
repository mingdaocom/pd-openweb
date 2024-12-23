import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, WaterMark, LoadDiv } from 'ming-ui';
import { ActionSheet, Button } from 'antd-mobile';
import cx from 'classnames';
import RecordForm from './RecordForm';
import RecordFooter from './RecordFooter';
import { Loading, Abnormal } from './RecordState';
import RelationAction from 'mobile/RelationRow/RelationAction';
import ChatCount from 'mobile/components/ChatCount';
import worksheetApi from 'src/api/worksheet';
import externalPortalApi from 'src/api/externalPortal';
import paymentAjax from 'src/api/payment';
import {
  KVGet,
  getRowGetType,
  checkCellIsEmpty,
  getRecordTempValue,
  saveTempRecordValueToLocal,
  removeTempRecordValueFromLocal,
  filterHidedSubList,
  emitter,
} from 'worksheet/util';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { updateRulesData, checkRuleLocked } from 'src/components/newCustomFields/tools/filterFn';
import { loadRecord, updateRecord } from 'worksheet/common/recordInfo/crtl';
import { formatControlToServer, controlState } from 'src/components/newCustomFields/tools/utils';
import { MobileRecordRecoverConfirm } from 'worksheet/common/newRecord/MobileNewRecord';
import { replaceControlsTranslateInfo } from 'worksheet/util';
import { getTranslateInfo } from 'src/util';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import * as actions from 'mobile/RelationRow/redux/actions';
import './RecordInfo.less';
import _ from 'lodash';

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
      childTableControlIds: [],
      restoreVisible: false,
      canSubmitDraft: false,
      payConfig: {}, // 支付相关
    };
    this.submitType = '';
    this.refreshEvents = {};
    this.cellObjs = {};
    this.confirmHandler = null;
    this.debounceRefresh = _.debounce(this.refreshEvent, 1000);
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
      this.loadNextRecord(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    const { relationRow } = this.props;
    const { currentTab, tempFormData = [] } = this.state;
    if (
      this.customwidget &&
      this.customwidget.current &&
      currentTab.type === 29 &&
      !_.isEqual(relationRow, prevProps.relationRow)
    ) {
      this.customwidget.current.handleChange(
        !_.isNaN(relationRow.count) ? relationRow.count : currentTab.value,
        currentTab.controlId,
        currentTab,
      );
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

      const childTableControlIds = updateRulesData({ rules: data.rules, data: data.formData })
        .filter(v => {
          if (v.type === 34) {
            const tab = _.find(tempControls, c => v.sectionId == c.controlId);
            return (
              (tab ? !v.hidden && controlState(v, from).visible : !_.get(tab, 'hidden') && controlState(tab, from)) &&
              !_.includes(['110', '010', '000', '011'], v.fieldPermission)
            );
          }
          return;
        })
        .map(it => it.controlId);

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
        tempFormData: data.formData,
        childTableControlIds: !_.isEmpty(childTableControlIds) ? childTableControlIds : undefined,
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
  getDraftParams = data => {
    const { draftFormControls = [] } = this.props;
    const formData = data
      .filter(it => it.controlId !== 'ownerid')
      .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32 && item.type !== 33)
      .filter(item => !checkCellIsEmpty(item.value));
    const formDataIds = formData.map(it => it.controlId);
    let paramControls = draftFormControls
      .map(v => (v.type === 29 && !v.value ? { ...v, value: '[]' } : v))
      .filter(it => !_.includes(formDataIds, it.controlId))
      .concat(formData);

    return paramControls.map(it => {
      if (it.type === 34) {
        return formatControlToServer(
          {
            ...it,
            value: _.isObject(it.value) ? { ...it.value, isAdd: true, updated: [] } : it.value,
          },
          { isNewRecord: true, isDraft: true },
        );
      }
      if (it.type === 14) {
        return formatControlToServer(it, { isSubListCopy: true, isNewRecord: true, isDraft: true });
      }
      return formatControlToServer(it, { isNewRecord: true, isDraft: true });
    });
  };
  saveDraftData = ({ draftType }) => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (draftType === 'submit') {
      this.submitType = 'draft';
      this.setState({ submitLoading: true });
      return this.customwidget.current.submitFormData();
    }
    this.setState({ submitLoading: true });
    const { data } = this.customwidget.current.getSubmitData({
      silent: true,
      ignoreAlert: true,
    });
    const { recordInfo, recordBase } = this.state;
    const { appId, viewId, worksheetId, recordId } = recordBase;

    worksheetApi
      .addWorksheetRow({
        projectId: recordInfo.projectId,
        appId,
        worksheetId,
        viewId,
        draftRowId: recordId,
        rowStatus: draftType === 'submit' ? 11 : 21,
        pushUniqueId: md.global.Config.pushUniqueId,
        receiveControls: this.getDraftParams(data),
      })
      .then(res => {
        if (res.resultCode === 1) {
          alert(draftType === 'submit' ? _l('记录添加成功') : _l('记录保存成功'));
          this.props.onClose();
          this.props.getDraftData({ appId, worksheetId });
        } else if (res.resultCode === 2) {
          alert(_l('当前草稿已保存，请勿重复提交'), 2);
        } else {
          alert(draftType === 'submit' ? _l('记录添加失败') : _l('记录保存失败'), 2);
        }
      })
      .catch(err => {
        if (_.isObject(err)) {
          alert(err.errorMessage || _l('记录添加失败'), 2);
        } else {
          alert(err || _l('记录添加失败'), 2);
        }
      });
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
  handleTriggerSave = () => {
    this.confirmHandler && this.confirmHandler.close();
    this.setState({
      formChanged: false,
      submitLoading: true,
    });
    this.customwidget.current.submitFormData();
  };
  handleSave = (error, { data, updateControlIds }) => {
    const { allowEmptySubmit, updateEditStatus = () => {} } = this.props;
    const { callback = () => {}, noSave, ignoreError } = this.submitOptions || {};
    const { recordInfo, recordBase, tempFormData } = this.state;
    const isPublicForm = _.get(window, 'shareState.isPublicForm') && window.shareState.shareId;

    // data = data.filter(c => !isRelateRecordTableControl(c));

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

    if (this.submitType === 'draft') {
      worksheetApi
        .addWorksheetRow({
          projectId: recordInfo.projectId,
          appId: recordBase.appId,
          worksheetId: recordBase.worksheetId,
          viewId: recordBase.viewId,
          draftRowId: recordBase.recordId,
          rowStatus: 11,
          pushUniqueId: md.global.Config.pushUniqueId,
          receiveControls: this.getDraftParams(data),
        })
        .then(res => {
          if (res.resultCode === 1) {
            alert(_l('记录添加成功'));
            this.props.onClose();
          } else if (res.resultCode === 11 && res.badData && !_.isEmpty(res.badData)) {
            let checkControl = _.find(data, v => _.includes(res.badData, v.controlId)) || {};
            alert(`${_l('%0不允许重复', checkControl.controlName)}`, 3);
            this.setState({ submitLoading: false });
          } else {
            alert(_l('记录添加失败'), 2);
            this.setState({ submitLoading: false });
          }
        })
        .catch(err => {
          if (_.isObject(err)) {
            alert(err.errorMessage || _l('记录添加失败'), 2);
          } else {
            alert(err || _l('记录添加失败'), 2);
          }
        });
    } else {
      const { from, instanceId, workId, updateSuccess, workflow } = this.props;
      this.abortChildTable();
      updateRecord(
        {
          appId: recordBase.appId,
          worksheetId: recordBase.worksheetId,
          viewId: recordBase.viewId,
          recordId: recordBase.recordId,
          getType: getRowGetType(from),
          projectId: recordInfo.projectId,
          instanceId,
          workId,
          data,
          updateControlIds,
          updateSuccess,
          isDraft: from === RECORD_INFO_FROM.DRAFT,
          allowEmptySubmit,
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
    }
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
    const { getDataType, worksheetInfo = {}, updateEditStatus = () => {} } = this.props;
    const { formChanged, isEditRecord, recordInfo, recordBase } = this.state;
    return (
      <RecordFooter
        formChanged={formChanged}
        isEditRecord={isEditRecord}
        isPublicShare={this.isPublicShare}
        recordBase={recordBase}
        recordInfo={recordInfo}
        childTableControlIds={this.state.childTableControlIds}
        canSubmitDraft={this.state.canSubmitDraft}
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
                        this.saveDraftData({ draftType: 'submit' });
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
            this.saveDraftData({ draftType: 'submit' });
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
                      onClick={() =>
                        getDataType === 21 ? this.saveDraftData({ draftType: 'draft' }) : this.handleTriggerSave()
                      }
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
          if (getDataType === 21) {
            return this.saveDraftData({ draftType: 'draft' });
          }
          this.handleTriggerSave();
        }}
        {...this.props}
      />
    );
  }
  renderFooter() {
    const { hideOtherOperate, footer } = this.props;
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
    const { isEditRecord, currentTab, externalPortalConfig, recordBase, recordInfo } = this.state;
    const { getDataType, isModal, isSubList, chartEntryStyle = {}, canLoadNextRecord } = this.props;
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
    const showNextRecordEntry = canLoadNextRecord && !_.includes(['approve', 'pay'], currentTab.id);

    if (showChatMessage || showNextRecordEntry) {
      return (
        <div
          className="extraAction flexRow"
          style={{
            bottom: _.includes(['approve', 'pay'], currentTab.id) ? 13 : undefined,
            ...chartEntryStyle,
          }}
        >
          {showNextRecordEntry && this.renderNextRecord()}
          {showChatMessage && (
            <div className="chatMessageContainer mLeft10">
              <ChatCount
                allowExAccountDiscuss={allowExAccountDiscuss}
                exAccountDiscussEnum={exAccountDiscussEnum}
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

  loadNextRecord = props => {
    const { currentSheetRows = [], loadNextPageRecords = () => {}, loadedRecordsOver } = props || this.props;
    const { recordId, loading } = this.state;

    if (loading || _.isEmpty(currentSheetRows)) return;

    const index = _.findIndex(currentSheetRows, record => {
      return record && record.rowid === recordId;
    });
    const newIndex = index + 1;
    if (!currentSheetRows[newIndex]) {
      if (!loadedRecordsOver && currentSheetRows.length >= 20) {
        loadNextPageRecords();
      } else {
        alert(_l('暂无下一条'), 3);
      }
      return;
    }
    const newRecordId = currentSheetRows[newIndex].rowid;

    this.setState({ recordId: newRecordId, loading: true }, this.loadRecord);
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

  renderNextRecord = () => {
    const { getDataType, isSubList } = this.props;
    const { isEditRecord } = this.state;
    if (getDataType === 21 || isEditRecord || isSubList) return null;

    return (
      <div className="nextEntryWrap" onClick={() => this.loadNextRecord()}>
        <i className="icon icon-arrow-down-border Font20 LineHeight44 Gray_75" />
      </div>
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
            loadDraftChildTableData={controlId => {
              const { childTableControlIds } = this.state;
              this.loadedChildIds = (this.loadedChildIds || []).concat(controlId);
              if (childTableControlIds.every(v => _.includes(this.loadedChildIds, v))) {
                this.setState({ canSubmitDraft: true });
              }
            }}
            changeMobileTab={tab => {
              this.props.updateRelationRows([], relationRow.count || 0);
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
            onChange={this.handleFormChange}
            onSave={this.handleSave}
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
